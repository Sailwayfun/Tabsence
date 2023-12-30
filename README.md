<div align="center">
  <a href="https://chromewebstore.google.com/detail/tabsence/icdbgchingbnboklhnagfckgjpdfjfeg?hl=zh-TW">
   <img src="public/assets/brand-logo.png" alt="brand logo" style="margin-bottom: 16px;" />
  </a>
  <div align="center" style="display:flex; justify-content: center; margin-bottom: 16px; gap: 8px;">
   <img src="https://img.shields.io/badge/react->=_18.2.0-blue" alt="react"/>
   <img src="https://img.shields.io/badge/eslint->=_8.45.0-blue" alt="react"/>
  </div>
</div>

# Tabsence

[Tabsence](https://chromewebstore.google.com/detail/tabsence/icdbgchingbnboklhnagfckgjpdfjfeg?hl=zh-TW) is a Chrome extension that organizes users’ browser tabs and boosts their productivity by tracking time spent on websites.

## About Tabsence

- Delivered an organized Internet experience, allowing users to sort and assign tabs into spaces, powered by `Chrome Extension API`.
- Synchronized browser tabs on the extension page by `onSnapshot` of Cloud FireStore.
- Optimized user experience by persisting the tabs and the spaces on the website with `Cloud Firestore` and `Chrome storage`.
- Tracked users' time spent on different websites, and visualized the data on the webpage using `Highcharts`.
- Implemented global state management with `Zustand`.

## Built with

<div align="center" style="display:flex; justify-content: center; margin-bottom: 16px; gap: 8px;">
   <img src="https://img.shields.io/badge/React-61DAFB.svg?style=for-the-badge&logo=React&logoColor=black" alt="React"/> 
   <img src="https://img.shields.io/badge/Firebase-FFCA28.svg?style=for-the-badge&logo=Firebase&logoColor=black" alt="Firebase"/>
   <img src="https://img.shields.io/badge/TypeScript-3178C6.svg?style=for-the-badge&logo=TypeScript&logoColor=white" alt="TypeScript"/>
   <img src="https://img.shields.io/badge/Tailwind%20CSS-06B6D4.svg?style=for-the-badge&logo=Tailwind-CSS&logoColor=white" alt="Tailwind CSS"/>
   <img src="https://img.shields.io/badge/Git-F05032.svg?style=for-the-badge&logo=Git&logoColor=white" alt="GIT"/>
   <img src="https://img.shields.io/badge/Vite-646CFF.svg?style=for-the-badge&logo=Vite&logoColor=white" alt="Vite">
</div>

Base

- React / Vite
- Zustand
- Firebase
- Tailwind
- ESLint
- TypeScript

Libraries

- react-hot-toast
- highcharts
- daisyui
- date-fns

## Flow chart

<div align="center">
   <img src="public/assets/flowchart.png" width="500" />
</div>

## Demo

- Opened Tabs in the browser will be rendered on the extension page at the same time.
<div style="padding: 12px 43px;">
   <img src="public/assets/sync-tabs.gif" width="500" alt="sync tabs" />
</div>

- Tabs can be viewed in list or grid views.
<div style="padding: 12px 43px;">
   <img src="public/assets/list-grid-views.gif" width="500" alt="sync tabs" />
</div>

- Users can sort the tabs on the extension page by clicking arrows on the tab card.
<div style="padding: 12px 43px;">
   <img src="public/assets/sort-tabs.gif" width="500" alt="sort tabs" />
</div>

