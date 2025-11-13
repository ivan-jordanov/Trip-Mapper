using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.NetworkInformation;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;
using TripMapperBL.DTOs;
using TripMapperBL.Interfaces;
using TripMapperDAL.Interfaces;
using TripMapperDB.Models;

namespace TripMapperBL.Services
{
    public class PinService : IPinService
    {
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;

        public PinService(IUnitOfWork uow, IMapper mapper)
        {
            _uow = uow;
            _mapper = mapper;
        }

        public async Task<IEnumerable<PinDto>> GetAllPinsAsync(int currentUserId)
        {
            var pins = await _uow.Pins.Query()
                .Where(x => x.UserId == currentUserId)
                .ToListAsync();

            return _mapper.Map<IEnumerable<PinDto>>(pins);
        }

        public async Task<PinDto?> GetPinByIdAsync(int id, int currentUserId)
        {
            var pin = await _uow.Pins.GetByIdAsync(id);
            if (pin == null || pin.UserId != currentUserId) return null;

            return _mapper.Map<PinDto>(pin);
        }

        public async Task<PinDto?> CreatePinAsync(CreatePinDto dto, int currentUserId, double latitude, double longitude)
        {
            var pin = await _uow.Pins.GetByTitleAsync(dto.Title, currentUserId);
            if (pin != null)
            {
                return null;
            }
            pin = _mapper.Map<Pin>(dto);
            pin.UserId = currentUserId;


            
            try
            {
                // Get Country, City & State data from nominatim reverse geolocation API

                // Better to change to IHttpClientFactory, but this works for now until in production
                var httpClient = new HttpClient(); 

                
                httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("TripMapperProject/1.0 (Contact: lollipopele@gmail.com)");
                httpClient.DefaultRequestHeaders.AcceptLanguage.ParseAdd("en");

                string url = $"https://nominatim.openstreetmap.org/reverse?format=xml&lat={latitude}&lon={longitude}";

                var response = await httpClient.GetAsync(url);


                response.EnsureSuccessStatusCode();

                // Response is in XML, deconstruct it.
                var xmlContent = await response.Content.ReadAsStringAsync();

                var doc = XDocument.Parse(xmlContent);
                var addressParts = doc.Descendants("addressparts").FirstOrDefault();

                if (addressParts != null)
                {
                    string city = addressParts.Element("city")?.Value ?? addressParts.Element("town")?.Value;
                    string country = addressParts.Element("country")?.Value;
                    string state = addressParts.Element("municipality")?.Value;

                    pin.City = city;
                    pin.Country = country;
                    pin.State = state; 
                }

            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"Nominatim API error: {ex.Message}");
                
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An unexpected error occurred: {ex.Message}");
            }

            await _uow.Pins.AddAsync(pin);
            await _uow.CompleteAsync();

            return _mapper.Map<PinDto>(pin);
        }

        public async Task<bool> DeletePinAsync(int id, int currentUserId)
        {
            var pin = await _uow.Pins.GetByIdAsync(id);
            if (pin == null || pin.UserId != currentUserId)
                return false;

            _uow.Pins.Delete(pin.Id);
            return await _uow.CompleteAsync();
        }
    }

}
