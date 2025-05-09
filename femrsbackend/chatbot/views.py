"""from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
import google.generativeai as genai
import os

# Set API Key for Google AI (Gemini)
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

@api_view(["POST"])
def chatbot_response(request):
    user_message = request.data.get("message", "").strip()

    if not user_message:
        return Response({"reply": "Please enter a message."})

    # Enhanced prompt to handle any type of question
    prompt = f"""  """
    You are an AI assistant capable of answering **any type of question** accurately.
    -your name is "maha lakshmi".
    - Reply in the **same language** as the user’s input.
    - If the question is related to **agriculture, farming, or soil**, include:
      - **Best suitable equipments** [English Term in Brackets] and also suggest a best one
      - **Best suitable methods or crops** [English Term in Brackets]
      - **Reasons for the recommendation**
      - **Tips to improve the outcome**
    - If the question is about **general topics**, provide a clear, **concise** answer.
    - If you don’t know the answer, politely state that.
    - Ensure important **English terms appear in brackets** for clarity.

    **User Query**: {user_message}
    """   """

    try:
        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)

        if response and response.text:
            reply = response.text.strip()
        else:
            reply = "I'm sorry, I couldn't find an answer. Please try rephrasing your question."

    except Exception as e:
        reply = "There was an issue processing your request. Please try again later."

    return Response({"reply": reply})
"""


from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
import google.generativeai as genai
import os
import requests


# Set API Keys
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")  # Store in .env file
WEATHER_URL = "http://api.weatherapi.com/v1/forecast.json"  # Use forecast API



def get_weather_forecast(city, target_lang="en"):
    """Fetch current & future weather data from WeatherAPI"""
    params = {
        "key": WEATHER_API_KEY,
        "q": city,
        "days": 3,  # Get 3-day forecast
        "aqi": "no",
        "alerts": "no"
    }
    
    response = requests.get(WEATHER_URL, params=params)
    data = response.json()
    
    if response.status_code == 200:
        current = data["current"]
        forecast = data["forecast"]["forecastday"]

        weather_info = (
            f"🌍 **Weather in {data['location']['name']}, {data['location']['country']}**\n"
            f"🌤️ Condition: {current['condition']['text']}\n"
            f"🌡️ Temp: {current['temp_c']}°C (Feels like {current['feelslike_c']}°C)\n"
            f"🌬️ Wind: {current['wind_kph']} km/h ({current['wind_dir']})\n"
            f"💧 Humidity: {current['humidity']}%\n"
            f"🌄 Sunrise: {forecast[0]['astro']['sunrise']} | 🌇 Sunset: {forecast[0]['astro']['sunset']}\n\n"
        )

        # Adding next 3 days' forecast
        weather_info += "**📅 3-Day Weather Forecast:**\n"
        for day in forecast:
            weather_info += (
                f"🔹 **{day['date']}**: {day['day']['condition']['text']}, "
                f"🌡️ {day['day']['maxtemp_c']}°C/{day['day']['mintemp_c']}°C, "
                f"💦 Rain Chance: {day['day']['daily_chance_of_rain']}%\n"
            )

        return weather_info
    else:
        return f"❌ Couldn't fetch weather details for {city}. Please check the city name."

def get_farming_suggestions(city, weather_condition):
    """Generate farming advice using Gemini AI based on weather"""
    prompt = f"""
    You are a smart agricultural assistant providing the best farming advice.
    - Dont deviate by user's other queries focus on farming, equipment and weather.
    - Reply in the **same language** as the user’s input. 
    - The current weather in {city} is **{weather_condition}**.
    - Suggest the **best crops** to grow and the **best equipment** to use.
    - Give **precautions** and **farming techniques** based on the weather.
    - Keep the response clear and easy to understand.
    Provide your answer in points for clarity.
    """

    try:
        model = genai.GenerativeModel("gemini-1.5-flash-latest")
        response = model.generate_content(prompt)
        farming_tips = response.text.strip() if response and response.text else "No farming advice available."
        return farming_tips
    except Exception:
        return "❌ Unable to fetch farming suggestions. Please try again."

@api_view(["POST"])
def chatbot_response(request):
    user_message = request.data.get("message", "").strip()

    if not user_message:
        return Response({"reply": "❗ Please enter a message."})

    # Check for weather-related queries
    if ("weather" in user_message.lower() or "forecast" in user_message.lower()) and len(user_message.split()) < 5:
        words = user_message.split()
        city = next((word for word in words if word.istitle()), None)  # Extract city name
        if city:
            weather_report = get_weather_forecast(city)
            # Generate farming suggestions based on current weather condition
            current_condition = weather_report.split("\n")[1].split(":")[1].strip()
            farming_tips = get_farming_suggestions(city, current_condition)
            return Response({"reply": f"{weather_report}\n\n🌾 **Farming Advice:**\n{farming_tips}"})
        return Response({"reply": '❗ Please specify a city to get weather details. For city name use camelcase ex: Vizag weather. '})

    # General chatbot response using Gemini AI
    prompt = f"""
    You are an AI assistant capable of answering **any type of question and Agriculture expert and weather analysis expert.** accurately.
    - Your name is "Maha Lakshmi" (female).
    - Reply in the **same language** as the user’s input.
    - If the question is related to **agriculture, farming, or soil**, include:
      - **Best suitable equipment** [English Term in Brackets] and also suggest the best one
      - **Best suitable methods or crops** [English Term in Brackets]
      - **Reasons for the recommendation**
      - **Tips to improve the outcome**
    - If the question is about **general topics**, provide a clear, **concise** answer.
    - If you don’t know the answer, politely state that.
    - Ensure important **English terms appear in brackets** for clarity.

    **User Query**: {user_message}
    """

    try:
        model = genai.GenerativeModel("gemini-1.5-flash-latest")
        response = model.generate_content(prompt)
        reply = response.text.strip() if response and response.text else "❌ I couldn't find an answer. Please try rephrasing your question."
    except Exception as e:
        reply = f"❗ Error: {str(e)}"  # Display the actual error
    return Response({"reply": reply})




# farmapp/views.py
from django.http import HttpResponse
from django.core.management import call_command

def migrate_view(request):
    call_command('makemigrations')
    call_command('migrate')
    return HttpResponse("Migrations Applied Successfully!")

def collectstatic_view(request):
    call_command('collectstatic', '--noinput')
    return HttpResponse("Static files collected successfully!")
