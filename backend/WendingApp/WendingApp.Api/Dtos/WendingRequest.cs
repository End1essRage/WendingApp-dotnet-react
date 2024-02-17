using System.Text;
using WendingApp.Data.Models;

namespace WendingApp.Api.Dtos
{
    public class WendingRequest
    {
        public Dictionary<int,int> Drinks { get; set; }
        public Dictionary<int, int> Coins { get; set; }

        public override string ToString()
        {
            StringBuilder sb = new StringBuilder();
            foreach(var drink in Drinks)
            {
                sb.AppendLine($"DrinkId is {drink.Key} and Count is {drink.Value}");
            }
            sb.AppendLine("--------------------------------------");
            foreach (var coin in Coins)
            {
                sb.AppendLine($"Nominal is {coin.Key} and Count is {coin.Value}");
            }

            return sb.ToString();
        }
    }
}
