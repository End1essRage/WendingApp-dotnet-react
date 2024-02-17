using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Text;

namespace WendingApp.Api.Controllers
{
    [Route("api/admin/auth")]
    [ApiController]
    public class AdminAuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        public AdminAuthController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpPost]
        public async Task<ActionResult<bool>> Authenticate([FromQuery] string key)
        {
            Console.WriteLine("--> Hitted Authenticate");

            //check key
            if (string.IsNullOrWhiteSpace(key))
            {
                Console.WriteLine("--> key is empty or null");
                return BadRequest();
            }
            if (_configuration["AdminKey"] != key)
            {
                Console.WriteLine("--> key is invalid");
                return new StatusCodeResult(StatusCodes.Status403Forbidden);
            }

            SetCookie();

            return Ok(true);
        }

        private void SetCookie()
        {
            Console.WriteLine("--> Setting Cookie");

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Expires = DateTime.UtcNow.AddDays(1)
            };

            var secret = _configuration["CookieSecret"];
            Response.Cookies.Append("Token", secret, cookieOptions);
        }
    }
}
