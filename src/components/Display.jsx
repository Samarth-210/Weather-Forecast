import React from 'react';
import {useState,useEffect} from 'react';

    function Display(){
    const[location,setLocation]=useState(null);
    const[lat,setLat]=useState(null);
    const[lon,setLon]=useState(null);
    const[population,setPopulation]=useState(null);
   
useEffect(()=>{
    if (!location) return;
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${location}&count=10&language=en&format=json`)
    .then(res=>res.json())
    .then((data)=>{
       console.log('geocoding response:', data);
       
       const arr = data?.results?.[0];
       if (arr) {
           setLat(arr.latitude);
           setLon(arr.longitude);
           setPopulation(arr.population);
       } else {
           
           setLat(null);
           setLon(null);
           setPopulation(null);
       }

    })

    .catch(err=>console.log(err));

},[location]);
const[time,setTime]=useState([]);
const[temperature,setTemperature]=useState([]);
useEffect(()=>{
    if(lat&&lon){
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m`)
        .then(res=>res.json())
        .then((data)=>{
            console.log('forecast response:', data);
            setTime(data.hourly.time);
            setTemperature(data.hourly.temperature_2m);
        })
        .catch(err=>console.error('forecast error:', err));
    }
},[lat,lon])
const[rain,setRain]=useState();
const[snow,setSnow]=useState();
const[wind,setWind]=useState();
const[sunrise,setSunrise]=useState();
const[sunset,setSunset]=useState();
const[day,setDay]=useState();
useEffect(()=>{
    if(lat&&lon){
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=sunrise,sunset,rain_sum,snowfall_sum,wind_speed_10m_max,precipitation_hours,precipitation_probability_max,daylight_duration`)
      .then(res=>res.json())
      .then((data)=>{
        console.log('climate response:', data);
        setRain(data.daily.rain_sum);
        setSnow(data.daily.snowfall_sum);
        setWind(data.daily.wind_speed_10m_max);
        setSunrise(data.daily.sunrise);
        setSunset(data.daily.sunset);
        setDay(data.daily.time);
      })
      .catch(err=>console.error('climate error:', err));
    }
},[lat,lon])
let pm10=[];
let pm2_5=[];
let co=[];
let no2=[];
let so2=[];
let o3=[];
const[AQI,setAQI]=useState();
let aqi=[];
function calAqi(pm2_5, pm10, co, no2, so2, o3) {
  

  const compute = (val, table) => {
    for (let i = 0; i < table.length; i++) {
      const [cl, ch, il, ih] = table[i];
      if (val >= cl && val <= ch) {
        return Math.round(((ih - il) / (ch - cl)) * (val - cl) + il);
      }
    }
    return 500;
  };

  const PM25_TABLE = [
    [0, 30, 0, 50],
    [31, 60, 51, 100],
    [61, 90, 101, 200],
    [91, 120, 201, 300],
    [121, 250, 301, 400],
    [251, 1000, 401, 500]
  ];

  const PM10_TABLE = [
    [0, 50, 0, 50],
    [51, 100, 51, 100],
    [101, 250, 101, 200],
    [251, 350, 201, 300],
    [351, 430, 301, 400],
    [431, 1000, 401, 500]
  ];

  const CO_TABLE = [
    [0, 1, 0, 50],
    [1.1, 2, 51, 100],
    [2.1, 10, 101, 200],
    [10.1, 17, 201, 300],
    [17.1, 34, 301, 400],
    [34.1, 1000, 401, 500]
  ];

  const NO2_TABLE = [
    [0, 40, 0, 50],
    [41, 80, 51, 100],
    [81, 180, 101, 200],
    [181, 280, 201, 300],
    [281, 400, 301, 400],
    [401, 1000, 401, 500]
  ];

  const SO2_TABLE = [
    [0, 40, 0, 50],
    [41, 80, 51, 100],
    [81, 380, 101, 200],
    [381, 800, 201, 300],
    [801, 1600, 301, 400],
    [1601, 5000, 401, 500]
  ];

  const O3_TABLE = [
    [0, 50, 0, 50],
    [51, 100, 51, 100],
    [101, 168, 101, 200],
    [169, 208, 201, 300],
    [209, 748, 301, 400],
    [749, 1000, 401, 500]
  ];

  for (let i = 0; i < pm2_5.length; i++) {
    const sub = [
      compute(pm2_5[i], PM25_TABLE),
      compute(pm10[i], PM10_TABLE),
      compute(co[i], CO_TABLE),
      compute(no2[i], NO2_TABLE),
      compute(so2[i], SO2_TABLE),
      compute(o3[i], O3_TABLE)
    ];
    aqi[i] = Math.max(...sub);
  }

  return aqi;
}

useEffect(()=>{
    if(lat&&lon){
        fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm10,pm2_5,carbon_monoxide,carbon_dioxide,nitrogen_dioxide,sulphur_dioxide,ozone`)
        .then(res=>res.json())
        .then((data)=>{
              console.log('air-quality response:', data);
              pm10=data.hourly.pm10;
              pm2_5=data.hourly.pm2_5;
              co=data.hourly.carbon_monoxide;
              no2=data.hourly.nitrogen_dioxide;
              so2=data.hourly.sulphur_dioxide;
              o3=data.hourly.ozone;
              calAqi(pm2_5,pm10,co,no2,so2,o3);
              console.log('calculated aqi:', aqi);
              let avg=0.0,sum=0;
              for(let i=0;i<aqi.length;i++){
                sum+=aqi[i];
              }
              avg=sum/aqi.length;
              setAQI(avg);
        })
          .catch(err=>console.error('air-quality error:', err));
    }
},[lat,lon])
return(
    <div className="bg-[url('weatherimg.jpg')] bg-cover w-full h-full">
    <div className="w-screen h-30 bg-linear-to-tl from-gray-800 to-gray-600 opacity-90 text-white bg-blend-luminosity flex justify-start items-center text-2xl font-serif rounded-xl   pl-10">
        Enter the location:
        <div className='w-sm h-20 bg-cyan-200 opacity-75 font-bold text-3xl text-black rounded-xl mr-4 pr-4 ml-20  flex justify-center items-center  '>
            
            <input type="text"  className='border-2 border-black border-solid rounded-md m-4  w-2xs'
             onChange={(e)=>setLocation(e.target.value)}/>
        </div>
    </div>
    <div className='min-h-lvh w-auto bg-linear-to-tr from-cyan-600 to-cyan-300 opacity-35 rounded-xl mt-16 flex justify-evenly items-start overflow-auto'>
         <ul className='text-neutral-950 font-extrabold font-stretch-condensed text-2xl ml-10 mt-10 mb-10 w-1/2'>
            Date and Time
            <div className='mt-6 max-h-80  '>
                <ul className='list-none pl-0'>
                    {time && time.length > 0 ? (
                        time.map((t, idx) => (
                            <li key={idx} className='text-2xl text-shadow-white mt-2'>
                                {t}
                            </li>
                        ))
                    ) : (
                        <li className='text-2xl mt-2'>No data</li>
                    )}
                </ul>
            </div>
         </ul>
         <ol className='text-neutral-950 font-extrabold font-stretch-condensed text-2xl pr-50 mr-5 mt-10 mb-10'>
            Temperature(°C) 
            <div className='mt-6 max-h-80 hide-scrollbar'>
                <ul className=' pl-6'>
                    {temperature && temperature.length > 0 ? (
                        temperature.map((t, idx) => (
                            <li key={idx} className='text-2xl text-shadow-white mt-2 mr-10'>
                                {t}
                            </li>
                        ))
                    ) : (
                        <li className='text-2xl mt-2'>No data</li>
                    )}
                </ul>
            </div>
         </ol>
           
    </div>
    <div className='min-h-48 backdrop-hue-rotate-30 w-full bg-linear-to-tr from-cyan-900 to-blue-500 opacity-90  flex justify-evenly items-start  rounded-xl mt-20 mb-10 overflow-auto'>
        <div className='text-white font-extrabold text-2xl ml-10 h-10 w-full  '>
            <ul className='list-none pl-0 mt-10'>
                Date:
                {day&&day.length>0? (day.map((val,idx)=>(
                    <li key={idx} className='text-2xl text-shadow-white mt-2'>
                        {val}
                    </li>
                )))
            :(<li className='text-white text-2xl mt-2'>N/A</li>)}
            
            </ul>
        </div>
        <div className='text-white font-extrabold text-2xl ml-10 h-10 w-full'>
            <ul className='list-none pl-10'>
                Precipitation(mm) 💧
                {rain&&rain.length>0? (rain.map((val,idx)=>(
                    <li key={idx} className='text-2xl text-shadow-white mt-2'>
                        {val}
                    </li>
                )))
            :(<li className='text-white text-2xl mt-2'>N/A</li>)}

            </ul>
        </div>
        <div className='text-white font-extrabold text-2xl ml-20 h-10 w-full'>
            <ul className='list-none pl-10'>
                Wind(km/h) 💨
                {wind && wind.length>0? (wind.map((val,idx)=>(
                   <li key={idx} className='text-white text-2xl text-shadow-white mt-2'>
                        {val}
                   </li>
                ))):
                <li className='text-white text-2xl mt-2'>N/A</li>}
            </ul>
        </div>
        <div className='text-white font-extrabold text-2xl ml-20 h-10 w-full'>
            <ul className='list-none pl-10'>
                Snowfall (cm) ❄️
                {snow && snow.length>0? (snow.map((val,idx)=>(
                   <li key={idx} className='text-white text-2xl text-shadow-white mt-2'>
                        {val}
                   </li>
                ))):
                <li className='text-white text-2xl mt-2'>N/A</li>}
            </ul>
        </div>  
    </div>
    <div className='h-40 w-full bg-linear-to-tr from-yellow-400 to-amber-600 opacity-90 flex justify-center items-center rounded-xl mb-10'>
        <div className='text-white font-extrabold text-2xl '>
            Air Quality Index (AQI): {AQI ? AQI.toFixed(2) : 'N/A'}
            {AQI <= 50 ? (
                <p className='text-green-400'>Good</p>
            ) : AQI <= 100 ? (
                <p className='text-yellow-400'>Moderate</p>
            ) : AQI <= 150 ? (
                <p className='text-orange-400'>Unhealthy for Sensitive Groups</p>
            ) : (
                <p className='text-red-400'>Unhealthy</p>
            )}
        </div>
        <div className='ml-20 text-white font-extrabold text-2xl '>
            Sunrise(GMT): {sunrise && sunrise.length > 0 ? sunrise[0].slice(sunrise.indexOf('T') + 1)+"\t" : 'N/A'}
        </div>
        <div className='ml-20 text-white font-extrabold text-2xl '>
            Sunset(GMT): {sunset && sunset.length > 0 ? sunset[0].slice(sunset.indexOf('T') + 1)+"\t" : 'N/A'}
           
        </div>
        <div className='ml-20 text-white font-extrabold text-2xl '>
            Population: {population ? population : 'N/A'}
        </div>
    </div>
</div>
    
    
)
}
export default Display;