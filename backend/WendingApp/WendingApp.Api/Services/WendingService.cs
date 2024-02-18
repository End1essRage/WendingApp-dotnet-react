using System.Reflection.Metadata.Ecma335;
using WendingApp.Api.Dtos;
using WendingApp.Data.Access;
using WendingApp.Data.Helpers;
using WendingApp.Data.Models;

namespace WendingApp.Api.Services
{
    struct GetCoinsListParams
    {
        public int[] Nominals;
        public Dictionary<int, int> CashCoins;
        public int TargetChange;
    }

    public class WendingService : IWendingService 
    {
        private readonly IDrinksRepository _drinksRepository;
        private readonly ICashRepository _cashRepository;
        public WendingService(IDrinksRepository drinksRepository, ICashRepository cashRepository)
        {
            _drinksRepository = drinksRepository;
            _cashRepository = cashRepository;
        }
        public async Task<IEnumerable<int>> GetUnBlockedNominals()
        {
            return await _cashRepository.GetCoinsAsync(c => !c.CashInBlocked);
        }

        public async Task<IEnumerable<Drink>> GetExistingDrinks()
        {
            return await _drinksRepository.GetAsync(d => d.Count > 0);
        }

        public async Task<WendingResponse> HandleWendingRequest(WendingRequest request)
        {
            Console.WriteLine($"--> Wending Request: \n {request.ToString()}");
            //calculate drinks total price
            var change = await CalculateChange(request);
            Console.WriteLine($"--> change: {change}");

            var cashCoinsModel = await _cashRepository.GetCoinsAsync();
            int[] nominals = cashCoinsModel.Select(c => c.Nominal).OrderDescending().ToArray();

            //try get coins for change
            Dictionary<int, int> cashCoins = new Dictionary<int, int>();
            foreach (var coin in cashCoinsModel)
            {
                cashCoins.Add(coin.Nominal, coin.Count);
            }

            var getCoinsListData = new GetCoinsListParams();
            getCoinsListData.Nominals = nominals;
            getCoinsListData.CashCoins = cashCoins;
            getCoinsListData.TargetChange = change;

            var changeCoins = GetCoinsListForChange(getCoinsListData, out int debt);

            Console.WriteLine($"--> Не получилось выдать сдачу на сумму - {debt} ");
            //Apply to Db
            var result = await ApplyWendingToDatabase(nominals, request, changeCoins);

            if (!result)
            {
                throw new Exception("Ошибка обработки запросана покупку");
            }

            //Format Response
            //List<CoinDto> coinsResponse = new List<CoinDto>();

            foreach(var coin in changeCoins)
            {
                Console.WriteLine($"--> change coin - \n: Nominal: {coin.Key} | Count: {coin.Value}");
            }

            var response = new WendingResponse();

            foreach (var nominal in nominals)
            {
                if(!changeCoins.TryGetValue(nominal, out int value))
                {
                    response.Coins.Add(new CoinDto() { Nominal = nominal, Count = 0 });
                }
                else
                {
                    response.Coins.Add(new CoinDto() { Nominal = nominal, Count = value });
                }
                response.Coins = response.Coins.OrderBy(c => c.Nominal).ToList();
            }
            response.Debt = debt;
            return response;
        }

        private async Task<int> CalculateChange(WendingRequest request)
        {
            var drinkModels = await _drinksRepository.GetAsync(c => request.Drinks.Keys.Contains(c.Id));
            int drinksPriceSum = 0;
            foreach (var drink in request.Drinks)
            {
                drinksPriceSum += drinkModels.First(c => c.Id == drink.Key).Price * drink.Value;
            }

            //calculate change
            int coinsSum = 0;
            foreach (var coin in request.Coins)
            {
                coinsSum += coin.Key * coin.Value;
            }

            var change = coinsSum - drinksPriceSum;

            if (change < 0)
                throw new Exception();

            return change;
        }
         
        
        private Dictionary<int,int> GetCoinsListForChange(GetCoinsListParams data , out int debt)
        {
            //Монеты сдачи
            Dictionary<int, int> changeCoins = new Dictionary<int, int>();

            //алгоритм выбора монет для сдачи
            foreach (var nominal in data.Nominals)
            {
                if (data.TargetChange == 0)
                    break;

                if (data.TargetChange >= nominal)
                {
                    if (data.CashCoins[nominal] > 0)
                    {
                        var targetMultiplier = data.TargetChange / nominal;
                        var actualMultiplier = data.CashCoins[nominal] >= targetMultiplier ? targetMultiplier : data.CashCoins[nominal];
                        data.TargetChange -=  actualMultiplier * nominal;

                        changeCoins.Add(nominal, actualMultiplier);
                    }
                }
            }

            debt = data.TargetChange;

            return changeCoins;
        }

        private async Task<bool> ApplyWendingToDatabase(int[] nominals, WendingRequest request, Dictionary<int,int> changeCoins)
        {
            foreach (var nominal in nominals)
            {
                var inCoins = !request.Coins.ContainsKey(nominal) ? 0 : request.Coins[nominal];
                var outCoins = !changeCoins.ContainsKey(nominal) ? 0 : changeCoins[nominal];
                var perCoinChange = inCoins - outCoins;

                if(perCoinChange != 0)
                    _cashRepository.UpdateCoinAmount(nominal, perCoinChange);
            }

            // drinks - UpdateProperties
            foreach (var drink in request.Drinks)
            {
                var countChange = new Dictionary<string, string>();
                countChange.Add(AppConstants.DRINK_PROPERTY_NAME_COUNT, (-drink.Value).ToString());
                _drinksRepository.UpdateProperties(drink.Key, countChange, true);       
            }

            return await _cashRepository.SaveChangesAsync();
        }
    }
}
