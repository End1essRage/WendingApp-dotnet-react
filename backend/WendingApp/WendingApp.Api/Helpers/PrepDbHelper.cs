using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WendingApp.Api.Dtos;
using WendingApp.Data.Access;
using WendingApp.Data.Models;

namespace WendingApp.Api.Helpers
{
    public static class PrepDbHelper
    {
        public static void Migrate(IApplicationBuilder app)
        {
            using (var serviceScope = app.ApplicationServices.CreateScope())
            {
                var context = serviceScope.ServiceProvider.GetService<AppDbContext>();
                context.Database.Migrate();
            }
        }

        public static void SeedData(IApplicationBuilder app)
        {
            using (var serviceScope = app.ApplicationServices.CreateScope())
            {
                var context = serviceScope.ServiceProvider.GetService<AppDbContext>();

                Coin[] coins = new Coin[]
                {
                    new Coin() { Nominal = 1 , Count = 10},
                    new Coin() { Nominal = 2, Count = 3},
                    new Coin() { Nominal = 5, Count = 1},
                    new Coin() { Nominal = 10, Count = 0}
                };
                context.Coins.AddRange(coins);

                Drink[] drinks = new Drink[]
                {
                    new Drink() { Name = "Sprite", Price = 6, Count = 10 },
                    new Drink() { Name = "Coke", Price = 12, Count = 10 },
                    new Drink() { Name = "Pulpy", Price = 8, Count = 10 },
                    new Drink() { Name = "Pivo", Price = 3, Count = 10 }
                };

                context.Drinks.AddRange(drinks);

                context.SaveChanges();
            }
        }
    }
}
