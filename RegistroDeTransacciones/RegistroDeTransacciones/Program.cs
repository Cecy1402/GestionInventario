using Microsoft.EntityFrameworkCore;
using RegistroDeTransacciones.Data;
using RegistroDeTransacciones.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


builder.Services.AddDbContext<TransactionsDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddHttpClient("transactions");
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(8081); // Puerto HTTP
});

var origenPermitir = builder.Configuration.GetValue<string>("AuthorizedOrigin")!.Split(",");

// Register CORS before building the app
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(origenPermitir).AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();

 
//using (var scope = app.Services.CreateScope())
//{
    //var db = scope.ServiceProvider.GetRequiredService<TransactionsDbContext>();
    //db.Database.Migrate();
//}
 

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
} 

app.UseHttpsRedirection();
app.UseCors();

app.UseAuthorization();

app.MapControllers();


app.Run();
