using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using WendingApp.Data.Helpers;
using WendingApp.Data.Models;

namespace WendingApp.Data.Access
{
    public class DrinksRepository : IDrinksRepository
    {
        private readonly AppDbContext _context;
        public DrinksRepository(AppDbContext context)
        {
            _context = context;
        }

        public void Create(Drink drink)
        {
            _context.Drinks.Add(drink);
        }

        public async Task<IEnumerable<Drink>> GetAsync()
        {
            return await _context.Drinks.ToListAsync();
        }

        public async Task<IEnumerable<Drink>> GetAsync(Expression<Func<Drink, bool>> filter)
        {
            IQueryable<Drink> query = _context.Drinks;
            if(filter != null)
            {
                query = query.Where(filter);
            }
            return await query.ToListAsync();
        }

        public async Task<Drink> GetByIdAsync(int id)
        {
            return await _context.Drinks.SingleOrDefaultAsync(d => d.Id == id);
        }

        public void Delete(int id)
        {
            _context.Drinks.Remove(_context.Drinks.Find(id));
        }

        public void UpdateProperties(int id, Dictionary<string,string> properties, bool byLambda)
        {
            Drink drink = _context.Drinks.FirstOrDefault(d => d.Id == id);

            if (drink == null)
                throw new ArgumentException();
            
            foreach (var property in properties)
            {
                switch(property.Key)
                {
                    case AppConstants.DRINK_PROPERTY_NAME_PRICE:
                        int price;

                        if (!Int32.TryParse(property.Value, out price))
                            throw new ArgumentException();

                        drink.Price = byLambda ? drink.Price + price : price;
                        _context.Entry(drink).Property(s => s.Price).IsModified = true;
                        break;
                    case AppConstants.DRINK_PROPERTY_NAME_COUNT:
                        int count;
                        if (!Int32.TryParse(property.Value, out count))
                            throw new ArgumentException();

                        drink.Count = byLambda ? drink.Count + count : count;

                        if (drink.Count < 0)
                            throw new InvalidOperationException();

                        _context.Entry(drink).Property(s => s.Count).IsModified = true;
                        break;
                }
            }     
        }

        public async Task<bool> SaveChangesAsync()
        {
            return (await _context.SaveChangesAsync()) > 0;
        }
    }
}
