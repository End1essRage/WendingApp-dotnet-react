using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using WendingApp.Api.Dtos;
using WendingApp.Data.Access;

namespace WendingApp.Api.Controllers
{
    [Route("api/admin/cash")]
    [ApiController]
    public class AdminCashController : ControllerBase
    {
        private readonly ICashRepository _cashRepository;
        private readonly IConfiguration _configuration;
        private readonly IMapper _mapper;
        private readonly IMemoryCache _memoryCache;
        public AdminCashController(
            ICashRepository cashRepository,
            IConfiguration configuration,
            IMapper mapper,
            IMemoryCache memoryCache)
        {
            _cashRepository = cashRepository;
            _configuration = configuration;
            _mapper = mapper;
            _memoryCache = memoryCache;
        }

        //Get all cashInfo
        [HttpGet(Name = "GetCashInfo")] // returns current status
        public async Task<ActionResult<IEnumerable<CoinAdminReadDto>>> GetCashInfo()
        {
            Console.WriteLine("--> Hitted GetCashInfo");

            if (!ValidateCookie())
                return new StatusCodeResult(StatusCodes.Status403Forbidden);

            var coins = await _cashRepository.GetCoinsAsync();

            return Ok(_mapper.Map<IEnumerable<CoinAdminReadDto>>(coins));
        }

        //Change coins amount
        [HttpPut] // returns current status
        public async Task<ActionResult> ChangeCashAmount(CoinDto[] coinDtos)
        {
            Console.WriteLine("--> Hitted ChangeCashAmount");

            if (!ValidateCookie())
                return new StatusCodeResult(StatusCodes.Status403Forbidden);

            foreach(CoinDto coinDto in coinDtos)
            {
                try
                {
                    _cashRepository.UpdateCoinAmount(coinDto.Nominal, coinDto.Count);
                }
                catch (InvalidOperationException)
                {
                    return BadRequest("Cant apply such count");
                }
                catch (ArgumentException ae)
                {
                    return BadRequest("No Such Nominal");
                }
                catch (Exception e)
                {
                    return BadRequest(e.Message);
                }
            }
            
            var result = await _cashRepository.SaveChangesAsync();

            if(!result)
            {
                return BadRequest("Transaction not commited");
            }

            var coins = await _cashRepository.GetCoinsAsync();

            return AcceptedAtRoute(nameof(GetCashInfo), null , _mapper.Map<IEnumerable<CoinAdminReadDto>>(coins));
        }

        //switch blocked coin
        [HttpPatch("{nominal}")] 
        public async Task<ActionResult<bool>> SwitchCashInBlocked(int nominal)
        {
            Console.WriteLine("--> Hitted SwitchCashInBlocked");

            if (!ValidateCookie())
                return new StatusCodeResult(StatusCodes.Status403Forbidden);

            bool? currentStatus = null;

            try
            {
                currentStatus = _cashRepository.SwitchCoinBlocking(nominal);
            }
            catch(ArgumentException ae)
            {
                return BadRequest();
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }

            var result = await _cashRepository.SaveChangesAsync();

            if(!result)
            {
                return BadRequest($"Изменения не применились, текущий статус блокировки монеты номиналом {nominal} - {!currentStatus}");
            }

            _memoryCache.Remove("nominals");

            return Ok(currentStatus);
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
