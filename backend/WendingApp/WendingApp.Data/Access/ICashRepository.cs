using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using WendingApp.Data.Models;

namespace WendingApp.Data.Access
{
    public interface ICashRepository
    {
        public Task<IEnumerable<Coin>> GetCoinsAsync();
        public Task<IEnumerable<int>> GetCoinsAsync(Expression<Func<Coin, bool>> filter);
        public Task<Coin> GetCoinByNominalAsync(int nominal);
        public void UpdateCoinAmount(int nominal, int lambda);
        public bool SwitchCoinBlocking(int nominal);
        public Task<bool> SaveChangesAsync();
    }
}
