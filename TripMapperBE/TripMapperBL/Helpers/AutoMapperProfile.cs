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

            

            CreateMap<FriendRequest, FriendRequestDto>()
                .ForMember(d => d.RequesterUsername, opt => opt.MapFrom(s => s.Requester.Username))
                .ForMember(d => d.RequesterKnownAs, opt => opt.MapFrom(s => s.Requester.KnownAs))
                .ForMember(d => d.AddresseeUsername, opt => opt.MapFrom(s => s.Addressee.Username))
                .ForMember(d => d.AddresseeKnownAs, opt => opt.MapFrom(s => s.Addressee.KnownAs));

            CreateMap<Category, CategoryDto>();
            CreateMap<CreateCategoryDto, Category>();

            CreateMap<Photo, PhotoDto>();

            CreateMap<TripAccess, TripAccessDto>()
                .ForMember(d => d.Username, opt => opt.MapFrom(s => s.User.Username))
                .ForMember(d => d.KnownAs, opt => opt.MapFrom(s => s.User.KnownAs));

            CreateMap<Trip, TripDto>()
                .ForMember(d => d.SharedUsernames, opt => opt.MapFrom(s => s.TripAccesses
                    .Where(a => a.AccessLevel == "View")
                    .Select(a => a.User.Username)))
                .ForMember(d => d.Pins, opt => opt.MapFrom(s => s.Pins))
                .ForMember(d => d.Photos, opt => opt.MapFrom(s => s.Photos))
                .ForMember(d => d.PreviewPhotoUrl, opt => opt.MapFrom(s =>
                    s.Photos.Where(photo => photo.PinId == null).Select(photo => photo.Url).FirstOrDefault()
                    ?? s.Photos.Select(photo => photo.Url).FirstOrDefault()
                    ?? ""));

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
