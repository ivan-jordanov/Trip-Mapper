using AutoMapper;
using TripMapperDB.Models;
using TripMapperBL.DTOs;

namespace TripMapperBL.Helpers
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<DateTime, DateOnly>()
                .ConvertUsing(src => DateOnly.FromDateTime(src));
            CreateMap<DateOnly, DateTime>()
                .ConvertUsing(src => src.ToDateTime(TimeOnly.MinValue));

            CreateMap<User, UserDto>();

            CreateMap<Category, CategoryDto>();
            CreateMap<CreateCategoryDto, Category>();

            CreateMap<Photo, PhotoDto>();

            CreateMap<TripAccess, TripAccessDto>();

            CreateMap<Trip, TripDto>()
                .ForMember(d => d.Pins, opt => opt.MapFrom(s => s.Pins))
                .ForMember(d => d.Photos, opt => opt.MapFrom(s => s.Photos));

            CreateMap<Pin, PinDto>()
                .ForMember(d => d.Trip, opt => opt.Ignore()) // pinDto has a reference to trip, so ignore it to avoid circular loop
                .ForMember(d => d.Category, opt => opt.MapFrom(s => s.Category))
                .ForMember(d => d.User, opt => opt.MapFrom(s => s.User))
                .ForMember(d => d.Photos, opt => opt.MapFrom(s => s.Photos));

            CreateMap<CreatePinDto, Pin>()
                .ForMember(dest => dest.Photos, opt => opt.Ignore());
            CreateMap<CreateTripDto, Trip>().ForMember(dest => dest.Pins, opt => opt.Ignore());;
            CreateMap<UpdateTripDto, Trip>();

        }
    }
}
