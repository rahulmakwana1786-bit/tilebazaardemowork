# Tech Stack
- Language - Typescript
- frontend - NextJS & Tailwind CSS
- backend - Nodejs + Expressjs + Supabase
- database - PostgreSQL on Supabase

## Logins Credentials
- Cloudinary - 
    - Login through google account (Brave)
    - email - website.espressomedia@gmail.com
- Emailjs - 
    - details in a sheet file named login details in drive
- Supabase - 
    - Login through google account (Brave)
    - email - website.espressomedia@gmail.com
- Oauth - https://console.cloud.google.com/welcome?project=tilebazaar
    - Login through google account (Brave)
    - email - website.espressomedia@gmail.com
- Vercel - 
    - Login through google account (Brave)
    - email - website.espressomedia@gmail.com
- Railway - 
    - Login through google account (Brave)
    - email - website.espressomedia@gmail.com

## To run Backend in Local
- Open terminal and navigate to the backend folder(with -> cd backend)
- Run command -> npm run dev

## To run Frontend in Local
- Open terminal and navigate to the frontend folder(with -> cd frontend)
- Run command -> npm run dev

## Backend Structure
- main folder "src" contains config, models, controllers, routes, middlewares, utils
- index.ts is the entry point of the application
- Flow of this will be 
    - index.ts -> routes -> middlewares -> controller -> models
- Backend API base url is http://localhost:5000 for testing in "postman" 
    - auth -> http://localhost:5000/api/auth
    - products -> http://localhost:5000/api/products
    - cart -> http://localhost:5000/api/cart
    - orders -> http://localhost:5000/api/orders
    - admin -> http://localhost:5000/api/admin


### Pre-requisites
- Redux & Redux Toolkit 
- NextJS

## Frontend Structure
- main folder "app" contain every page of site
- app/layout.tsx is the root layout
- app/page.tsx is the home page
- app/login/page.tsx is the login page
- app/signup/page.tsx is the signup page

- lib/axios.ts -> create axios instance for making requests to the backend  
- store/store.ts -> setup redux store  
- store/slice -> folder containing all the slices  
    - from backend changes -> these slices -> components -> UI 

## Deployment (temporary purpose)
- Frontend - Vercel
- Backend - Railway



