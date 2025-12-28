using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TripMapperDB.Models;
using TripMapperBL.Helpers;
using TripMapper.Services;
using TripMapperDAL.Interfaces;
using TripMapperDAL.Repositories;
using TripMapperBL.Interfaces;
using TripMapperBL.Services;

namespace TripMapper
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add CORS policy
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("ReactPolicy", policy =>
                {
                    policy
                        .WithOrigins("http://localhost:3000") 
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials(); 
                });
            });



            // Connect SQL Server DB
            builder.Services.AddDbContext<TripMapperContext>(options =>
                options.UseSqlServer(
                    builder.Configuration.GetConnectionString("TripMapperDB"),
                    sql => sql.EnableRetryOnFailure() 
                ));

            // Connect backblaze(cloud file hosting service)
            builder.Services.Configure<BackblazeSettings>(builder.Configuration.GetSection("BackblazeSettings"));

            // DAL Repositories
            builder.Services.AddScoped<IPinRepository, PinRepository>();
            builder.Services.AddScoped<ITripRepository, TripRepository>();
            builder.Services.AddScoped<IPhotoRepository, PhotoRepository>();
            builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
            builder.Services.AddScoped<IUserRepository, UserRepository>();
            builder.Services.AddScoped<ITripAccessRepository, TripAccessRepository>();

            // DAL Repositories with Stored Procedures
            //builder.Services.AddScoped<IPinRepository, PinRepositorySp>();
            //builder.Services.AddScoped<ITripRepository, TripRepositorySp>();
            //builder.Services.AddScoped<IPhotoRepository, PhotoRepositorySp>();
            //builder.Services.AddScoped<ICategoryRepository, CategoryRepositorySp>();
            //builder.Services.AddScoped<IUserRepository, UserRepositorySp>();
            //builder.Services.AddScoped<ITripAccessRepository, TripAccessRepositorySp>();

            // BL Services
            builder.Services.AddScoped<IPinService, PinService>();
            builder.Services.AddScoped<ITripService, TripService>();
            builder.Services.AddScoped<IUserService, UserService>();
            builder.Services.AddScoped<IPhotoService, PhotoService>();
            builder.Services.AddScoped<ICategoryService, CategoryService>();

            // API Services
            builder.Services.AddScoped<PhotoUploadService>();

            // Unit of work
            builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
            //builder.Services.AddScoped<IUnitOfWork, UnitOfWorkSP>();

            // Controllers and services
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            //builder.Services.AddAutoMapper(typeof(AutoMapperProfile).Assembly);
            builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());




            // Authorization with JWT

            builder.Services.AddScoped<TokenService>();

            var key = Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]);

            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(key),
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidIssuer = builder.Configuration["Jwt:Issuer"],
                        ValidAudience = builder.Configuration["Jwt:Audience"]
                    };
                });

            builder.Services.AddAuthorization();

            var app = builder.Build();


            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseCors("ReactPolicy");

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
