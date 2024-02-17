using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using System.Collections.Generic;
using WendingApp.Api.Dtos;
using WendingApp.Api.Services;
using WendingApp.Data.Models;
using YandexDisk.Client.Clients;
using YandexDisk.Client.Http;
using YandexDisk.Client.Protocol;

namespace WendingApp.Api.Controllers
{
    [Route("api/wending")]
    [ApiController]
    public class WendingController : ControllerBase
    {
        private readonly IWendingService _wendingService;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;
        private readonly IMemoryCache _memoryCache;
        private readonly DiskHttpApi _api;
        
        public WendingController(
            IWendingService wendingService,
            IMapper mapper,
            IConfiguration configuration,
            IMemoryCache memoryCache)
        {
            _wendingService = wendingService;
            _mapper = mapper;
            _configuration = configuration;
            _memoryCache = memoryCache;

            _api = new DiskHttpApi(_configuration["YandexDiskApiKey"]);
        }

        [HttpGet("drinks")]
        public async Task<ActionResult<IEnumerable<DrinkReadDto>>> GetAllDrinks()
        {
            var items = await _wendingService.GetExistingDrinks();

            return Ok(_mapper.Map<IEnumerable<DrinkReadDto>>(items));
        }

        [HttpGet("drinks/{id}/img")]
        public async Task<ActionResult<IFormFile>> GetDrinkImage(int id)
        {
            Console.WriteLine("--> Hitted GetDrinkImage");

            var fileData = await _api.MetaInfo.GetInfoAsync(new ResourceRequest()
            {
                Path = "app:/",
            });

            var file = fileData.Embedded.Items.SingleOrDefault(c => c.Name.Split('.')[0] == id.ToString());

            if (file == null)
                return NotFound();

            var fileStream = await _api.Files.DownloadFileAsync(file.Path);

            return File(fileStream, file.MimeType);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<int>>> GetUnblockedNominals()
        {
            if (!_memoryCache.TryGetValue("nominals", out List<int>? nominals))
            {
                Console.WriteLine("from db nominals");

                var items = await _wendingService.GetUnBlockedNominals();
                nominals = items.ToList();

                _memoryCache.Set("nominals", nominals);
            }

            return Ok(nominals);
        }

        [HttpPost]
        public async Task<ActionResult<IEnumerable<CoinDto>>> DoWending(WendingRequest wendingDto)
        {
            Console.WriteLine("--> Hitted DoWending");

            if (wendingDto.Drinks == null || wendingDto.Drinks.Count < 1 || wendingDto.Drinks.Any(c => c.Value == 0))
            {
                return BadRequest();
            }

            try
            {
                var response = await _wendingService.HandleWendingRequest(wendingDto);
                return Ok(response);
            }
            catch (ArgumentException e)
            {
                Console.WriteLine("-->Ошибка обработки запросана покупку неправильный реквест");
                return BadRequest();
            }
            catch (InvalidOperationException e)
            {
                Console.WriteLine("--> Ошибка обработки запросана покупку невозможно применить как бд");
                return BadRequest();
            }
            catch (Exception e)
            {
                Console.WriteLine($"-->  {e.Message}");
                return BadRequest();
            }      
        }
    }
}
