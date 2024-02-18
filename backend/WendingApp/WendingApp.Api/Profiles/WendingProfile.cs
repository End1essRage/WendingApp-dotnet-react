using AutoMapper;
using WendingApp.Api.Dtos;
using WendingApp.Data.Models;

namespace WendingApp.Api.Profiles
{
    public class WendingProfile : Profile
    {
        public WendingProfile() 
        {
            CreateMap<DrinkCreateDto, Drink>();
            CreateMap<Drink, DrinkReadDto>();
            CreateMap<Coin, CoinDto>();
            CreateMap<Coin, CoinAdminReadDto>()
                .ForMember(dest => dest.Locked, opt => opt.MapFrom(src => src.CashInBlocked)); ;
        }
    }
}
