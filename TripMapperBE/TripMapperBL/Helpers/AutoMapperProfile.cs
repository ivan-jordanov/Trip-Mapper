using AutoMapper;
using TripMapperDB.Models;
using TripMapperBL.DTOs;

namespace TripMapperBL.Helpers
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<User, UserDto>();

            CreateMap<Category, CategoryDto>();

            CreateMap<Photo, PhotoDto>();

            CreateMap<Trip, TripDto>()
                .ForMember(d => d.Pins, opt => opt.MapFrom(s => s.Pins))
                .ForMember(d => d.Photos, opt => opt.MapFrom(s => s.Photos));

            CreateMap<Pin, PinDto>()
                .ForMember(d => d.Trip, opt => opt.MapFrom(s => s.Trip))
                .ForMember(d => d.Category, opt => opt.MapFrom(s => s.Category))
                .ForMember(d => d.User, opt => opt.MapFrom(s => s.User))
                .ForMember(d => d.Photos, opt => opt.MapFrom(s => s.Photos));
            CreateMap<CreatePinDto, Pin>();

            CreateMap<Category, CategoryDto>().ReverseMap();
            CreateMap<CreateCategoryDto, Category>();

        }
    }
}
