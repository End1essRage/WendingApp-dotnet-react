using Microsoft.EntityFrameworkCore;
using WendingApp.Api.Helpers;
using WendingApp.Api.Services;
using WendingApp.Data.Access;

var builder = WebApplication.CreateBuilder(args);

if (builder.Environment.IsDevelopment())
{
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseInMemoryDatabase("WendingDb"));
}
else
{
    string connectionString = builder.Configuration.GetConnectionString("PostgresConnection");
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(connectionString, b => b.MigrationsAssembly("WendingApp.Api")));
}

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(
        policy =>
        {
            policy.WithOrigins("http://localhost:3000")
             .AllowAnyHeader()
             .AllowAnyMethod()
             .AllowCredentials();
        });
});

// Add services to the container.
builder.Services.AddMemoryCache();
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
builder.Services.AddScoped<ICashRepository, CashRepository>();
builder.Services.AddScoped<IDrinksRepository, DrinksRepository>();
builder.Services.AddScoped<IWendingService, WendingService>();

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseCors();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthorization();

app.MapControllers();



if (app.Environment.IsProduction())
{
    PrepDbHelper.Migrate(app);
}
else
{
    PrepDbHelper.SeedData(app);
}

app.Run();
