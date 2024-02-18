using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using WendingApp.Data.Models;

namespace WendingApp.Data.Access
{
    public class CashRepository : ICashRepository
    {
        private readonly AppDbContext _context;
        public CashRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Coin> GetCoinByNominalAsync(int nominal)
        {
            return await _context.Coins.SingleOrDefaultAsync(c => c.Nominal == nominal);
        }

        public async Task<IEnumerable<Coin>> GetCoinsAsync()
        {
            return await _context.Coins.ToListAsync();
        }

        public async Task<IEnumerable<int>> GetCoinsAsync(Expression<Func<Coin, bool>> filter)
        {
            IQueryable<Coin> query = _context.Coins;
            if (filter != null)
            {
                query = query.Where(filter);
            }
            return await query.Select(c => c.Nominal).ToListAsync();
        }

        public async Task<bool> SaveChangesAsync()
        {
            return (await _context.SaveChangesAsync()) > 0;
        }

        public bool SwitchCoinBlocking(int nominal)
        {
            var coinModel = _context.Coins.FirstOrDefault(c => c.Nominal == nominal);
            if (coinModel == null)
                throw new ArgumentException();

            coinModel.CashInBlocked = !coinModel.CashInBlocked;
            _context.Entry(coinModel).Property(s => s.CashInBlocked).IsModified = true;

            return coinModel.CashInBlocked;
        }

        public void UpdateCoinAmount(int nominal, int lambda)
        {
            var coin = _context.Coins.FirstOrDefault(c => c.Nominal == nominal);
            if(coin == null) throw new ArgumentException();

            coin.Count += lambda;

            _context.Entry(coin).Property(s => s.Count).IsModified = true;
        }
    }
}
