using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using WendingApp.Data.Models;

namespace WendingApp.Data.Access
{
    public interface IDrinksRepository
    {
        public Task<IEnumerable<Drink>> GetAsync();
        public Task<IEnumerable<Drink>> GetAsync(Expression<Func<Drink, bool>> filter);  
        public Task<Drink> GetByIdAsync(int id);
        public void Create(Drink drink);
        public void UpdateProperties(int id, Dictionary<string, string> properties, bool byLambda);// byLambda - если да то значение прибавляется, если нет - перезаписывается
        public void Delete(int id);
        public Task<bool> SaveChangesAsync();
    }
}
