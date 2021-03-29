let db = firebase.firestore();
let storage = firebase.storage();

consultarIncidencias();

let form = document.getElementById('form');

form.addEventListener('submit', function (e) {
    let inputs = e.target.elements;
    let titulo = inputs['titulo'].value;
    let descripcion = inputs['descripcion'].value;
    let archivo = inputs['archivo'].files[0];
    let incidencia = {
        titulo,
        descripcion,
        imgPath: new Date().getTime() + '_' + archivo.name
    };
    subirArchivo(archivo, incidencia.imgPath, (response) => {
        if (response) {
            console.log('el archivo se subio');
            agregarIncidencia(incidencia);
        } else {
            console.log('el archivo no se subio');
        }
    });
    e.preventDefault();
});

// function miMetodo(response) {
//     if (response) {
//         console.log('el archivo se subio');
//         agregarIncidencia(incidencia);
//     } else {
//         console.log('el archivo no se subio');
//     }
// }

// const fileSelector = document.getElementById('file-selector');
// fileSelector.addEventListener('change', (event) => {
//     file = event.target.files[0];
// });

function subirArchivo(file, name, callback) {
    let imagenRef = storage.ref().child(name);
    imagenRef.put(file).then(function (snapshot) {
        // console.log('Uploaded a blob or file!');
        callback(true);
    }).catch(err => {
        callback(false);
        console.error(err)
    });
}

function agregarIncidenciaTabla(incidencia) {
    let tbody = document.getElementById('table-body');

    let tdImagen = document.createElement('td');
    let img = document.createElement('img');
    tdImagen.appendChild(img);
    obtenerUrlImagen(img, incidencia.imgPath);
    let tdId = document.createElement('td');
    tdId.innerText = incidencia.id;
    let tdTitulo = document.createElement('td');
    tdTitulo.innerText = incidencia.titulo;
    let tdDescripcion = document.createElement('td');
    tdDescripcion.innerText = incidencia.descripcion;

    let tdEliminar = document.createElement('td');
    tdEliminar.appendChild(crearBotonEliminar());

    let trIncidencia = document.createElement('tr')
    trIncidencia.append(tdImagen, tdId, tdTitulo, tdDescripcion, tdEliminar);
    tbody.appendChild(trIncidencia);
}

function obtenerUrlImagen(imagen, imgPath) {
    storage.ref().child(imgPath).getDownloadURL().then(function (url) {
        imagen.src = url;
        imagen.style.maxWidth = '100%';
    }).catch(function (error) {
        console.log(err);
    });
}

function crearBotonEliminar() {
    let boton = document.createElement('button');
    boton.classList.add('btn');
    boton.classList.add('btn-danger');
    boton.classList.add('btn-sm');
    boton.innerText = 'Eliminar';
    boton.addEventListener('click', eliminarIncidencia);
    return boton;
}

function eliminarIncidencia(e) {
    let id = e.target.parentNode.parentNode.firstChild.innerText;
    let tr = e.target.parentNode.parentNode;
    db.collection("incidencias").doc(id).delete().then(() => {
        console.log("Document successfully deleted!");
        tr.remove();
    }).catch((error) => {
        console.error("Error removing document: ", error);
    });
}

function consultarIncidencias() {
    db.collection("incidencias").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            let incidencia = {
                id: doc.id,
                titulo: doc.data().titulo,
                descripcion: doc.data().descripcion,
                imgPath: doc.data().imgPath
            };
            agregarIncidenciaTabla(incidencia);
        });
    });
}

function agregarIncidencia(incidencia) {
    db.collection("incidencias")
        .add(incidencia)
        .then((docRef) => {
            console.log("Document written with ID: ", docRef.id);
            form.reset();
            document.getElementById('table-body').innerHTML = '';
            consultarIncidencias();
        })
        .catch((error) => {
            console.error("Error adding document: ", error);
            form.reset();
        });
}