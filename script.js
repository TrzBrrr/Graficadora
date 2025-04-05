// script.js
function generarTabla() {
    const funcionInput = document.getElementById("funcionInput").value;
    const dominioInput = document.getElementById("dominioInput").value;
    const tipo = document.getElementById("tipoRepresentacion").value;
    const errorDiv = document.getElementById("errorFuncion");
    const procedimientoDiv = document.getElementById("procedimiento");
    const resultadoAnalisis = document.getElementById("resultadoAnalisis");
    const svg = document.getElementById("svgFlechas");
    const contenedorNodos = document.getElementById("contenedorNodos");
  
    errorDiv.innerHTML = "";
    procedimientoDiv.innerHTML = "";
    resultadoAnalisis.innerHTML = "";
    contenedorNodos.innerHTML = "";
    svg.innerHTML = "";
    document.getElementById("grafico").style.display = "none";
    document.getElementById("tablaValores").innerHTML = "";
  
    let dominio;
    try {
      dominio = dominioInput.split(",").map(x => parseFloat(x.trim()));
      if (dominio.some(isNaN)) throw new Error();
    } catch {
      errorDiv.innerHTML = "Dominio inválido";
      return;
    }
  
    let f;
    try {
      f = new Function("x", "return " + funcionInput);
      f(1);
    } catch {
      errorDiv.innerHTML = "Función inválida";
      return;
    }
  
    const valores = dominio.map(x => ({ x, y: f(x) }));
  
    // Dominio y Rango
    const codominio = valores.map(v => v.y);
    const rango = [...new Set(codominio)];
  
    resultadoAnalisis.innerHTML = `
      <h3>Análisis:</h3>
      <p><strong>Dominio:</strong> {${dominio.join(", ")}}</p>
      <p><strong>Codominio:</strong> {${codominio.join(", ")}}</p>
      <p><strong>Rango:</strong> {${rango.join(", ")}}</p>
    `;
  
    // Procedimiento
    procedimientoDiv.innerHTML += `<h3>Procedimiento:</h3>`;
    valores.forEach(v => {
      procedimientoDiv.innerHTML += `
        <pre>
          x = ${v.x}
          y = f(x) = ${funcionInput}
          y = ${funcionInput.replaceAll("x", `(${v.x})`)} = ${v.y}
        </pre>
      `;
    });
  
    if (tipo === "cartesiana") {
      document.getElementById("grafico").style.display = "block";
      new Chart(document.getElementById("grafico"), {
        type: "line",
        data: {
          labels: dominio,
          datasets: [{
            label: "f(x)",
            data: codominio,
            fill: false,
            borderColor: "#3498db",
            tension: 0.1
          }]
        }
      });
    } else if (tipo === "tabla") {
      let tablaHTML = `<table border="1"><tr><th>x</th><th>f(x)</th></tr>`;
      valores.forEach(v => {
        tablaHTML += `<tr><td>${v.x}</td><td>${v.y}</td></tr>`;
      });
      tablaHTML += `</table>`;
      document.getElementById("tablaValores").innerHTML = tablaHTML;
    } else if (tipo === "sagital") {
      const dom = [...new Set(valores.map(v => v.x))];
      const ran = [...new Set(valores.map(v => v.y))];
      const svgWidth = 600;
      const svgHeight = 300;
  
      const drawNode = (x, y, text, color) => {
        const nodo = document.createElement("div");
        nodo.className = "nodo";
        nodo.style.left = `${x}px`;
        nodo.style.top = `${y}px`;
        nodo.innerText = text;
        nodo.style.backgroundColor = color;
        contenedorNodos.appendChild(nodo);
      };
  
      const nodePositions = {};
      dom.forEach((val, i) => {
        const x = 100;
        const y = 50 + i * 50;
        nodePositions[`x${val}`] = { x, y };
        drawNode(x, y, val, "#3498db");
      });
  
      ran.forEach((val, i) => {
        const x = 400;
        const y = 50 + i * 50;
        nodePositions[`y${val}`] = { x, y };
        drawNode(x, y, val, "#2ecc71");
      });
  
      valores.forEach(v => {
        const inicio = nodePositions[`x${v.x}`];
        const fin = nodePositions[`y${v.y}`];
        const flecha = document.createElementNS("http://www.w3.org/2000/svg", "line");
        flecha.setAttribute("x1", inicio.x + 20);
        flecha.setAttribute("y1", inicio.y + 20);
        flecha.setAttribute("x2", fin.x + 20);
        flecha.setAttribute("y2", fin.y + 20);
        flecha.setAttribute("stroke", "#000");
        flecha.setAttribute("marker-end", "url(#arrow)");
        svg.appendChild(flecha);
      });
  
      const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
      marker.setAttribute("id", "arrow");
      marker.setAttribute("markerWidth", "10");
      marker.setAttribute("markerHeight", "10");
      marker.setAttribute("refX", "0");
      marker.setAttribute("refY", "3");
      marker.setAttribute("orient", "auto");
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", "M0,0 L0,6 L9,3 z");
      path.setAttribute("fill", "#000");
      marker.appendChild(path);
      const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      defs.appendChild(marker);
      svg.appendChild(defs);
    }
  }
  