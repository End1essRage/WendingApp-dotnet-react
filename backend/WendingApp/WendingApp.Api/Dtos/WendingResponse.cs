namespace WendingApp.Api.Dtos
{
    public class WendingResponse
    {
        public List<CoinDto> Coins { get; set; } = new List<CoinDto>();
        public int Debt { get; set; }
    }
}
