using WendingApp.Api.Dtos;
using WendingApp.Data.Models;

namespace WendingApp.Api.Services
{
    public interface IWendingService
    {
        public Task<IEnumerable<Drink>> GetExistingDrinks();
        public Task<IEnumerable<int>> GetUnBlockedNominals();
        public Task<WendingResponse> HandleWendingRequest(WendingRequest request);
    }
}
