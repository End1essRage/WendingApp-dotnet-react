using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.Collections.Generic;
using System.Drawing;
using System.Text;
using WendingApp.Api.Dtos;
using WendingApp.Data.Access;
using WendingApp.Data.Helpers;
using WendingApp.Data.Models;
using YandexDisk.Client.Clients;
using YandexDisk.Client.Http;
using YandexDisk.Client.Protocol;

namespace WendingApp.Api.Controllers
{
    [Route("api/admin/drinks")]
    [ApiController]
    public class AdminDrinksController : ControllerBase
    {
        private readonly IDrinksRepository _drinksRepository;
        private readonly IConfiguration _configuration;
        private readonly IMapper _mapper;
        private readonly DiskHttpApi _api;
        public AdminDrinksController(
            IDrinksRepository drinksRepository,
            IConfiguration configuration,
            IMapper mapper)
        {
            _drinksRepository = drinksRepository;
            _configuration = configuration;
            _mapper = mapper;
            _api = new DiskHttpApi(_configuration["YandexDiskApiKey"]);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DrinkReadDto>>> GetAllDrinks()
        {
            if(!ValidateCookie())
                return new StatusCodeResult(StatusCodes.Status403Forbidden);

            var items = await _drinksRepository.GetAsync();
            return Ok(_mapper.Map<IEnumerable<DrinkReadDto>>(items));
        }

        [HttpGet("{id}", Name = "GetDrinkById")]
        public async Task<ActionResult<DrinkReadDto>> GetDrinkById(int id)
        {
            Console.WriteLine("--> Hitted GetDrinkById");

            if (!ValidateCookie())
                return new StatusCodeResult(StatusCodes.Status403Forbidden);

            var item = await _drinksRepository.GetByIdAsync(id);

            if(item == null)
            {
                return NotFound();
            }

            return Ok(_mapper.Map<DrinkReadDto>(item));
        }

        [HttpPost]
        public async Task<ActionResult> CreateDrink(DrinkCreateDto drinkCreateDto)
        {
            Console.WriteLine("--> Hitted CreateDrink");

            if (!ValidateCookie())
                return new StatusCodeResult(StatusCodes.Status403Forbidden);

            if(drinkCreateDto.Count < 0)
                return BadRequest();
            

            var model = _mapper.Map<Drink>(drinkCreateDto);
            _drinksRepository.Create(model);

            var result = await _drinksRepository.SaveChangesAsync();

            if(!result)
            {
                //InternalServerError
                return BadRequest();
            }

            var drinkReadDto = _mapper.Map<DrinkReadDto>(model);

            //CreatedAtRoute GetDrinkById
            return CreatedAtRoute(nameof(GetDrinkById), new { Id = drinkReadDto.Id }, drinkReadDto);
        }

        [HttpPatch("{id}")]
        public async Task<ActionResult> UpdateDrink(int id, DrinkUpdateDto drinkUpdateDto)
        {
            Console.WriteLine("--> Hitted UpdateDrink");

            if (!ValidateCookie())
                return new StatusCodeResult(StatusCodes.Status403Forbidden);

            Dictionary<string,string> newParams = new Dictionary<string,string>();

            if(drinkUpdateDto.Count != null)
            {
                newParams.Add(AppConstants.DRINK_PROPERTY_NAME_COUNT, drinkUpdateDto.Count.ToString());
            }
            if(drinkUpdateDto.Price != null)
            {
                newParams.Add(AppConstants.DRINK_PROPERTY_NAME_PRICE, drinkUpdateDto.Price.ToString());
            }
            try
            {
                _drinksRepository.UpdateProperties(id, newParams, !drinkUpdateDto.Rewrite);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
           
            var result = await _drinksRepository.SaveChangesAsync();

            if(!result)
            {
                //InternalServerError
                return BadRequest();
            }

            var drinkModel = await _drinksRepository.GetByIdAsync(id);
            var drinkReadDto = _mapper.Map<DrinkReadDto>(drinkModel);

            return AcceptedAtRoute(nameof(GetDrinkById), new { Id = drinkReadDto.Id }, drinkReadDto);
        }

        [HttpDelete("{id}", Name = "DeleteDrinkById")]
        public async Task<ActionResult> DeleteDrinkById(int id)
        {
            Console.WriteLine("--> Hitted DeleteDrinkById");

            if (!ValidateCookie())
                return new StatusCodeResult(StatusCodes.Status403Forbidden);

            var item = await _drinksRepository.GetByIdAsync(id);

            if (item == null)
            {
                return NotFound();
            }

            _drinksRepository.Delete(id);

            var result = await _drinksRepository.SaveChangesAsync();
            if (!result)
            {
                //InternalServerError
                return BadRequest();
            }

            return Ok();
        }

        [HttpPost("{id}/img")]
        public async Task<ActionResult> UpdateDrinkPhoto(int id, IFormFile file)
        {
            Console.WriteLine("--> Hitted UpdateDrinkPhoto");

            if (!ValidateCookie())
                return new StatusCodeResult(StatusCodes.Status403Forbidden);

            var item = await _drinksRepository.GetByIdAsync(id);

            if (item == null)
            {
                return NotFound();
            }

            //Check is Image
            if(file.ContentType != "image/jpeg" && file.ContentType != "image/png")
            {
                return BadRequest("Not Image");
            }    
            //Save To Disk

            using (var stream = file.OpenReadStream())
            {
                await _api.Files.UploadFileAsync(path: "app:/" + id,
                                      overwrite: true,
                                      file: stream,
                                      cancellationToken: CancellationToken.None);
            }

            return Ok();

        }

        [HttpGet("{id}/img")]
        public async Task<ActionResult<IFormFile>> GetDrinkImage(int id)
        {
            Console.WriteLine("--> Hitted GetDrinkImage");

            if (!ValidateCookie())
                return new StatusCodeResult(StatusCodes.Status403Forbidden);

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

        private bool ValidateCookie()
        {
            return true;
            Console.WriteLine("--> Validating Cookie");

            var token = Request.Cookies["Token"];

            if (string.IsNullOrEmpty(token))
                return false;

            if (token != _configuration["CookieSecret"])
                return false;

            return true;
        }
    }
}
