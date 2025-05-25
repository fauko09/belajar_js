// // const var1 = 1; // number
// // const var2 = "hello"; // string

// // const array1 = []; // array
// // const array2 = [1, 2, 5, 3]; // array

// // let object1 = {}; // object
// // const object2 = { a: 1, b: 2, c: 3, d: 4 }; // object

// // console.log("objek a: ", object2.a);
// // console.log("array index 0: ", array2[0]);

// // for (let i = 0; i < array2.length; i++) {
// //   console.log("tes loops: ", array2[i]);
// // }

// // for (let key in object2) {
// //   console.log("tesss: ", object2[key]);
// // }

// // object2.d = 4; // add new property
// // console.log(object2);

// // delete object2.a; // delete property

// // array1[0] = 1; // change array element

// // array2.push(4); // add element to array

// // object1 = {
// //   angka: array2,
// // };

// // for (let i = 0; i < object1.angka.length; i++) {
// //   console.log(object1.angka[i]);
// // }

// // function function1(nama = "budi", kelas = "XII") {
// //   console.log(nama);
// //   console.log(kelas);
// // }

// // function1("yosep", "XII");

// // let objectNew = {
// //   key1: "value1",
// //   key2: "value2",
// // };

// let nama = "yosep b";

// // console.log(nama.split(" ")[0]);
// // console.log("asdasd: ", nama.split(" ")[0]); // split perkata

// // console.log(nama.substring(0, 3));

// // console.log(nama.indexOf("b"));
// // console.log(nama.indexOf("p"));

// // console.log(nama.charAt(2));

// // const object1 = { a: "asdasd", b: "asdasd", c: "asdasd", d: "asdasd" };

// // Object.fromEntries();

// // Object.assign(object1, { a: 1, b: 2, c: 3, d: 4 });
// // Object.entries(object1).forEach(([key, value]) => {
// //   console.log(key);
// // });

// // const Mahasiswa = [
// //   {
// //     nama: "Yosep",
// //     nik: 123123,
// //     jurusan: "TI",
// //     nilai: 80,
// //     // lulus: true,
// //     tugas: ["tugas 1", "tugas 2", "tugas 3"],
// //   },
// //   {
// //     nama: "Fauko",
// //     nik: 123123,
// //     jurusan: "TI",
// //     nilai: 70,
// //     // lulus: true,
// //     tugas: ["tugas 1", "tugas 2", "tugas 3"],
// //   },
// // ];

// // const MataKuliah = {
// //   semester1: ["matkul 1", "matkul 2", "matkul 3"],
// //   semester2: ["matkul 4", "matkul 5", "matkul 6"],
// // };

// // console.log(Mahasiswa);
// // console.log(MataKuliah);

// // const result = Object.groupBy(Mahasiswa, ({ nilai }) =>
// //   nilai < 75 ? "tidak_lulus" : "lulus"
// // );

// // console.log(result.tidak_lulus);

// // async function myDisplay() {
// //   let var1 = "haloo";
// //   let myPromise = new Promise(function (resolve) {
// //     setTimeout(function () {
// //       resolve("I love You !!");
// //     }, 3000);
// //   });

// //   console.log(var1);
// //   console.log(await myPromise);
// // }

// // myDisplay();

// const hello = (nama, kelas) => {
//   return console.log(nama, kelas);
// };

// hello("yosep", "XII");