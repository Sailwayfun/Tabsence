// import { useState, useEffect } from "react";

// export default function useWindowId(): number {
//   const [windowId, setWindowId] = useState<number>(0);

//   useEffect(() => {
//     let active = true;
//     async function getCurrentWindowId(): Promise<number> {
//       return new Promise((resolve, reject) => {
//         chrome.windows.getCurrent((window) => {
//           if (active && window && window.id) {
//             resolve(window.id);
//             return;
//           }
//           reject();
//         });
//       });
//     }
//     getCurrentWindowId()
//       .then((res) => {
//         setWindowId(res);
//       })
//       .catch((err) => console.error(err));
//     return () => {
//       active = false;
//     };
//   }, []);

//   return windowId;
// }
