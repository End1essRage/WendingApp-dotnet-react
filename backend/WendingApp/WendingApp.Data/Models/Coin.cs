using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WendingApp.Data.Models
{
    public class Coin
    {
        public int Id { get; set; }
        public int Nominal { get; set; }
        public int Count { get; set; }
        public bool CashInBlocked { get; set; } = false;
    }
}
