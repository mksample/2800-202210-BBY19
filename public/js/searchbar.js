"use strict";

// ready(async function () {
//       async function getData(url) {
//         const response = await fetch(url, {
//           method: 'GET',
//           mode: 'same-origin',
//           cache: 'default',
//           credentials: 'same-origin',
//           headers: {
//             'Content-Type': 'application/json',
//             'X-Requested-With': 'XMLHttpRequest'
//           },
//           redirect: 'follow',
//           referrerPolicy: 'no-referrer',
//         });
//         return response.json();
//       }
//     }

function profileSearch() {

  console.log("Search button pushed");
  let keyword = document.getElementById("searchKeyword").value;
  console.log(keyword);
  document.getElementById("search_result").innerHTML = keyword;

  // let response = await getData("/getUsers");
  // if (response) {
  //   if (response.status == "fail") {
  //     console.log(response.msg);
  //   } else {
  //     let contentDOM = document.getElementById("search_profile");
  //     for (const user of response.users) {
  //       createProfileDisplay(user, contentDOM);
  //     }
  //   }
  // }
}