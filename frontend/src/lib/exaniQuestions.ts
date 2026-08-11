export interface Question {
  id: number;
  section: string;
  q: string;
  visual: string | null;
  opts: string[];
  ans: number;
  expl: string;
  context: {
    title: string;
    content: string;
  } | null;
}

export const exaniQuestions: Question[] = [
  {
    "id": 1,
    "q": "Las ventas del primer semestre del año de una tienda de abarrotes se muestran en la gráfica. ¿Cuál es la media aritmética de las ventas?",
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "visual": "\n                    <div class=\"flex flex-col items-center\">\n                        <div class=\"bar-chart mb-6\">\n                            <div class=\"bar\" style=\"height: 60px;\"><span class=\"bar-value\">10k</span><span class=\"bar-label\">Ene</span></div>\n                            <div class=\"bar\" style=\"height: 81px;\"><span class=\"bar-value\">13.5k</span><span class=\"bar-label\">Feb</span></div>\n                            <div class=\"bar\" style=\"height: 75px;\"><span class=\"bar-value\">12.5k</span><span class=\"bar-label\">Mar</span></div>\n                            <div class=\"bar\" style=\"height: 69px;\"><span class=\"bar-value\">11.5k</span><span class=\"bar-label\">Abr</span></div>\n                            <div class=\"bar\" style=\"height: 87px;\"><span class=\"bar-value\">14.5k</span><span class=\"bar-label\">May</span></div>\n                            <div class=\"bar\" style=\"height: 66px;\"><span class=\"bar-value\">11k</span><span class=\"bar-label\">Jun</span></div>\n                        </div>\n                        <p class=\"text-xs text-gray-500 mt-4 italic text-center\">*Alturas proporcionales a valores aproximados</p>\n                    </div>",
    "opts": [
      "$11,000.00",
      "$12,166.67",
      "$13,000.00"
    ],
    "ans": 1,
    "expl": "Suma: 10 + 13.5 + 12.5 + 11.5 + 14.5 + 11 = 73. Media = 73 / 6 = 12.166...",
    "context": null
  },
  {
    "id": 2,
    "q": "La tabla muestra las edades de 130 pacientes. ¿Cuál es la edad por debajo de la cual queda el 95% de los pacientes?",
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "visual": "\n                    <table class=\"w-full text-sm text-left text-gray-500 border border-gray-200\">\n                        <thead class=\"text-xs text-gray-700 uppercase bg-gray-50\">\n                            <tr><th class=\"px-4 py-2\">Edad</th><th class=\"px-4 py-2\">Frecuencia</th><th class=\"px-4 py-2\">Acumulada</th></tr>\n                        </thead>\n                        <tbody>\n                            <tr class=\"bg-white border-b\"><td>45</td><td>7</td><td>7</td></tr>\n                            <tr class=\"bg-white border-b\"><td>50</td><td>12</td><td>19</td></tr>\n                            <tr class=\"bg-white border-b\"><td>55</td><td>16</td><td>35</td></tr>\n                            <tr class=\"bg-white border-b\"><td>60</td><td>18</td><td>53</td></tr>\n                            <tr class=\"bg-white border-b\"><td>62</td><td>22</td><td>75</td></tr>\n                            <tr class=\"bg-white border-b\"><td>66</td><td>25</td><td>100</td></tr>\n                            <tr class=\"bg-white\"><td>68</td><td>30</td><td>130</td></tr>\n                        </tbody>\n                    </table>",
    "opts": [
      "66 años",
      "62 años",
      "68 años"
    ],
    "ans": 2,
    "expl": "95% de 130 es 123.5. Buscamos en la acumulada el valor que cubra 123.5. Hasta 66 años van 100. Hasta 68 años van 130 (cubre el 95%).",
    "context": null
  },
  {
    "id": 3,
    "q": "Observe el camino del caminante en la cuadrícula. Si gira siempre considerando su mano derecha, ¿cuántas cuadras al ESTE caminó efectivamente?",
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "visual": "\n                    <div class=\"flex gap-4 items-center justify-center\">\n                        <div class=\"grid-walker\">\n                            <div class=\"grid-cell\"></div><div class=\"grid-cell\"></div><div class=\"grid-cell path\">End</div><div class=\"grid-cell\"></div><div class=\"grid-cell\"></div>\n                            <div class=\"grid-cell\"></div><div class=\"grid-cell\"></div><div class=\"grid-cell path\">↑</div><div class=\"grid-cell\"></div><div class=\"grid-cell\"></div>\n                            <div class=\"grid-cell\"></div><div class=\"grid-cell path\">←</div><div class=\"grid-cell path\">←</div><div class=\"grid-cell\"></div><div class=\"grid-cell\"></div>\n                            <div class=\"grid-cell\"></div><div class=\"grid-cell path\">↑</div><div class=\"grid-cell\"></div><div class=\"grid-cell\"></div><div class=\"grid-cell\"></div>\n                            <div class=\"grid-cell\"></div><div class=\"grid-cell path\">Start</div><div class=\"grid-cell\"></div><div class=\"grid-cell\"></div><div class=\"grid-cell\"></div>\n                        </div>\n                        <div class=\"text-2xl font-bold text-gray-400\">N ↑ <br> ← O E → <br> ↓ S</div>\n                    </div>",
    "opts": [
      "3 cuadras al oeste",
      "1 cuadra al norte",
      "4 cuadras al este"
    ],
    "ans": 2,
    "expl": "Siguiendo el recorrido visual y contando los segmentos orientados hacia la derecha (Este) en relación a los giros.",
    "context": null
  },
  {
    "id": 4,
    "q": "Área sombreada: Un sector circular de 90° con r=22m, menos un triángulo rectángulo inscrito de catetos 22m.",
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "visual": "\n                    <svg width=\"150\" height=\"150\" viewBox=\"0 0 100 100\" class=\"mx-auto\">\n                        <path d=\"M10,90 L90,90 A80,80 0 0,0 10,10 Z\" fill=\"#bfdbfe\" stroke=\"#2563eb\" stroke-width=\"2\" />\n                        <path d=\"M10,90 L90,90 L10,10 Z\" fill=\"white\" stroke=\"#ef4444\" stroke-width=\"2\" />\n                        <text x=\"40\" y=\"60\" font-size=\"10\" fill=\"#1e3a8a\">Área?</text>\n                    </svg>",
    "opts": [
      "104.06 m²",
      "863.94 m²",
      "137.94 m²"
    ],
    "ans": 2,
    "expl": "Área Sector = \\(\\frac{1}{4}\\pi(22)^2 \\approx 380.13\\). Área Triángulo = \\(\\frac{22 \\times 22}{2} = 242\\). Resta: 138.13.",
    "context": null
  },
  {
    "id": 5,
    "q": "¿Qué se puede concluir acerca del sistema de ecuaciones que se presenta en la gráfica?",
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "visual": "\n                    <svg width=\"200\" height=\"150\" class=\"bg-gray-100 border mx-auto\">\n                        <line x1=\"20\" y1=\"130\" x2=\"180\" y2=\"20\" stroke=\"red\" stroke-width=\"2\" />\n                        <line x1=\"20\" y1=\"20\" x2=\"180\" y2=\"130\" stroke=\"blue\" stroke-width=\"2\" />\n                        <circle cx=\"100\" cy=\"75\" r=\"4\" fill=\"black\" />\n                        <text x=\"105\" y=\"75\" font-size=\"12\">A</text>\n                    </svg>",
    "opts": [
      "No tiene solución",
      "El punto A es la solución",
      "Tiene infinitas soluciones"
    ],
    "ans": 1,
    "expl": "Cuando dos rectas se intersectan en un solo punto, ese punto (A) es la única solución del sistema.",
    "context": null
  },
  {
    "id": 6,
    "q": "Trigonometría: Altura de una antena con cable de 14m y ángulo de 58°.",
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "visual": "\n                    <svg width=\"150\" height=\"100\" class=\"mx-auto\">\n                        <line x1=\"20\" y1=\"90\" x2=\"20\" y2=\"10\" stroke=\"black\" stroke-width=\"3\" /> <!-- Antena -->\n                        <line x1=\"20\" y1=\"10\" x2=\"100\" y2=\"90\" stroke=\"gray\" stroke-width=\"2\" /> <!-- Cable -->\n                        <line x1=\"20\" y1=\"90\" x2=\"100\" y2=\"90\" stroke=\"black\" stroke-width=\"1\" /> <!-- Piso -->\n                        <text x=\"60\" y=\"40\" font-size=\"10\">14m</text>\n                        <text x=\"75\" y=\"85\" font-size=\"10\">58°</text>\n                    </svg>",
    "opts": [
      "24 m",
      "12.6 m",
      "7.8 m"
    ],
    "ans": 1,
    "expl": "\\( h = 14 \\times \\sin(58^\\circ) = 14 \\times 0.84 = 11.76 \\approx 12.6 \\).",
    "context": null
  },
  {
    "id": 7,
    "q": "Inecuación Café Internet: Renta $3000.45, cobro $10.10/h. Debe generar ingreso de *por lo menos* 300 horas.",
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "visual": null,
    "opts": [
      "\\( x = 300 \\)",
      "\\( x > 300 \\)",
      "\\( x \\geq 300 \\)"
    ],
    "ans": 2,
    "expl": "'Por lo menos' implica mayor o igual (≥).",
    "context": null
  },
  {
    "id": 8,
    "q": "¿Qué expresión es equivalente a \\((9a - 2b)(a - 2b)\\)?",
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "visual": null,
    "opts": [
      "\\(9a^2 - 12b^2\\)",
      "\\(9a^2 - 20ab + 4b^2\\)",
      "\\(9a^2 + 4b^2\\)"
    ],
    "ans": 1,
    "expl": "Multiplicando: 9a² - 18ab - 2ab + 4b² = 9a² - 20ab + 4b².",
    "context": null
  },
  {
    "id": 9,
    "q": "Resultado de \\(A - B + C\\) con \\(A=7x^3+3x, B=-x^2+4, C=-2x^3+7x^2\\).",
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "visual": null,
    "opts": [
      "...",
      "...",
      "\\(5x^3 + 8x^2 + 3x - 4\\)"
    ],
    "ans": 2,
    "expl": "Sumando términos semejantes: (7-2)x³ + (1+7)x² + 3x - 4.",
    "context": null
  },
  {
    "id": 10,
    "q": "Valor de x para \\(0.97^x > 1\\).",
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "visual": null,
    "opts": [
      "\\(x > 0\\)",
      "\\(x = 0\\)",
      "\\(x < 0\\)"
    ],
    "ans": 2,
    "expl": "Base < 1. Para que el resultado sea > 1, el exponente debe ser negativo.",
    "context": null
  },
  {
    "id": 11,
    "q": "Sistema: \\(-6x + 12y = 18\\) y \\(6x - 24y = -12\\).",
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "visual": null,
    "opts": [
      "\\(x = -4, y = -0.5\\)",
      "\\(x = -2...\\)",
      "\\(x = -0.5...\\)"
    ],
    "ans": 0,
    "expl": "Sumando: -12y = 6 → y = -0.5. Sustituyendo: -6x - 6 = 18 → x = -4.",
    "context": null
  },
  {
    "id": 12,
    "q": "Proporción \\(\\frac{P-8}{66} = \\frac{P+4}{75}\\). Hallar P.",
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "visual": null,
    "opts": [
      "96",
      "63",
      "92"
    ],
    "ans": 0,
    "expl": "75P - 600 = 66P + 264 → 9P = 864 → P = 96.",
    "context": null
  },
  {
    "id": 13,
    "q": "Si \\(\\sin \\theta = 3/5\\), calcule \\(\\cos \\theta\\).",
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "visual": null,
    "opts": [
      "\\(\\sqrt{16}/5\\) (4/5)",
      "3/5",
      "5/4"
    ],
    "ans": 0,
    "expl": "Triángulo 3-4-5. Cos = 4/5.",
    "context": null
  },
  {
    "id": 14,
    "q": "Estadística: Perla (goles: 7,3,5,2,4) vs Sonia (goles: 5,7,4,4,5). Promedio 5. Entrenador busca desempeño alejado del promedio.",
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "visual": null,
    "opts": [
      "Sonia",
      "Perla (mayor dispersión)",
      "Ambas"
    ],
    "ans": 1,
    "expl": "Perla tiene valores (2 y 7) más lejanos al promedio que Sonia.",
    "context": null
  },
  {
    "id": 15,
    "q": "Probabilidad: Bloques. Cuadrado Azul (13/20) vs Azul Cuadrado (13/24).",
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "visual": null,
    "opts": [
      "Igual",
      "Menor",
      "Mayor"
    ],
    "ans": 2,
    "expl": "13/20 (0.65) > 13/24 (0.54).",
    "context": null
  },
  {
    "id": 16,
    "q": "Tasas Covid: Ags (1.4M, 430), Hgo (3M, 310), SLP (2.8M, 590). Mayor tasa/1000 hab.",
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "visual": null,
    "opts": [
      "Aguascalientes",
      "Hidalgo",
      "San Luis"
    ],
    "ans": 0,
    "expl": "Ags: 0.30, SLP: 0.20, Hgo: 0.10.",
    "context": null
  },
  {
    "id": 17,
    "q": "Precio original: Pagó $53.34 con 10% descuento.",
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "visual": null,
    "opts": [
      "$587",
      "$59.27",
      "$544"
    ],
    "ans": 1,
    "expl": "P = 53.34 / 0.90 = 59.27.",
    "context": null
  },
  {
    "id": 18,
    "q": "Modelo Lineal: (430, 824), (220, 446).",
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "visual": null,
    "opts": [
      "y = 1.8x",
      "y = 1.8x + 50",
      "y = 0.51x + 333"
    ],
    "ans": 1,
    "expl": "m = 1.8, b = 50.",
    "context": null
  },
  {
    "id": 19,
    "q": "Relacionar Gráficas: 1) 3x²-3x, 2) 3x²-3x+9, 3) 3x²+3x-9",
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "visual": null,
    "opts": [
      "1c, 2b, 3a",
      "1a, 2b, 3c",
      "Other"
    ],
    "ans": 0,
    "expl": "La constante determina el desplazamiento vertical e intersección Y.",
    "context": null
  },
  {
    "id": 20,
    "q": "Simetría Mosaico (Imagen B - Doble eje):",
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "visual": null,
    "opts": [
      "Sin eje",
      "Un eje",
      "Más de un eje"
    ],
    "ans": 2,
    "expl": "Simetría vertical y horizontal.",
    "context": null
  },
  {
    "id": 21,
    "q": "Relojes: R1(10cm, 3hrs) vs R2(5cm, 1hr). ¿Giro?",
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "visual": null,
    "opts": [
      "R1 mayor giro",
      "R2 mayor giro",
      "Igual"
    ],
    "ans": 0,
    "expl": "90 grados vs 30 grados.",
    "context": null
  },
  {
    "id": 22,
    "q": "Diagrama de Árbol (Tormenta):",
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "visual": null,
    "opts": [
      "El diagrama es correcto",
      "Incorrecto"
    ],
    "ans": 0,
    "expl": "Muestra todas las combinaciones posibles.",
    "context": null
  },
  {
    "id": 23,
    "q": "Según el texto, ¿cuáles son dos ejemplos del ejercicio excesivo de la libertad de expresión?",
    "section": "2. Lectura y Comprensión (Español)",
    "visual": null,
    "opts": [
      "Debate público",
      "Mensajes que inciten a la violencia y dañen la imagen",
      "Bloqueo de cuentas"
    ],
    "ans": 1,
    "expl": "El texto menciona explícitamente: 'incitar a la violencia o dañar la imagen'.",
    "context": {
      "title": "TEXTO 1: Redes Sociales y Libertad de Expresión",
      "content": "El texto debate la libertad de expresión en redes sociales. Las plataformas como Facebook y Twitter han tomado decisiones sobre qué contenido permitir.<br><br>El bloqueo de Donald Trump tras la insurrección del Capitolio es un ejemplo central. Facebook bloqueó su cuenta de manera permanente. Twitter primero la cerró temporalmente, luego de forma permanente.<br><br>Se plantea una pregunta fundamental: ¿Es censura o es protección? El autor argumenta que la libertad no es absoluta si incita violencia. Los mensajes que inciten a la violencia o dañen la imagen de una persona exceden los límites de la libertad de expresión.<br><br>Sin embargo, existe una preocupación válida sobre el poder de las empresas privadas. ¿Deben estas compañías decidir qué es permitido decir? ¿O es competencia del gobierno? El texto presenta múltiples perspectivas sin tomar un lado extremo.<br><br>La conclusión es que debemos balancear la libertad de expresión con la protección de la seguridad pública. Cuando los mensajes incitan a la violencia, las restricciones pueden ser justificadas."
    }
  },
  {
    "id": 24,
    "q": "La red social _______ bloqueó permanentemente a Trump, mientras _______ primero cerró temporalmente.",
    "section": "2. Lectura y Comprensión (Español)",
    "visual": null,
    "opts": [
      "Facebook - Twitter",
      "Instagram - Facebook",
      "Twitter - Instagram"
    ],
    "ans": 0,
    "expl": "Según el párrafo 2: 'Twitter primero temporalmente, Facebook permanente'.",
    "context": {
      "title": "TEXTO 1: Redes Sociales y Libertad de Expresión",
      "content": "El texto debate la libertad de expresión en redes sociales. Las plataformas como Facebook y Twitter han tomado decisiones sobre qué contenido permitir.<br><br>El bloqueo de Donald Trump tras la insurrección del Capitolio es un ejemplo central. Facebook bloqueó su cuenta de manera permanente. Twitter primero la cerró temporalmente, luego de forma permanente.<br><br>Se plantea una pregunta fundamental: ¿Es censura o es protección? El autor argumenta que la libertad no es absoluta si incita violencia. Los mensajes que inciten a la violencia o dañen la imagen de una persona exceden los límites de la libertad de expresión.<br><br>Sin embargo, existe una preocupación válida sobre el poder de las empresas privadas. ¿Deben estas compañías decidir qué es permitido decir? ¿O es competencia del gobierno? El texto presenta múltiples perspectivas sin tomar un lado extremo.<br><br>La conclusión es que debemos balancear la libertad de expresión con la protección de la seguridad pública. Cuando los mensajes incitan a la violencia, las restricciones pueden ser justificadas."
    }
  },
  {
    "id": 25,
    "q": "Preocupación planteada:",
    "section": "2. Lectura y Comprensión (Español)",
    "visual": null,
    "opts": [
      "Regulaciones flexibles",
      "Influencia política",
      "Violación libertad y poder de empresas"
    ],
    "ans": 2,
    "expl": "El texto cuestiona el poder unilateral de las empresas privadas.",
    "context": {
      "title": "TEXTO 1: Redes Sociales y Libertad de Expresión",
      "content": "El texto debate la libertad de expresión en redes sociales. Las plataformas como Facebook y Twitter han tomado decisiones sobre qué contenido permitir.<br><br>El bloqueo de Donald Trump tras la insurrección del Capitolio es un ejemplo central. Facebook bloqueó su cuenta de manera permanente. Twitter primero la cerró temporalmente, luego de forma permanente.<br><br>Se plantea una pregunta fundamental: ¿Es censura o es protección? El autor argumenta que la libertad no es absoluta si incita violencia. Los mensajes que inciten a la violencia o dañen la imagen de una persona exceden los límites de la libertad de expresión.<br><br>Sin embargo, existe una preocupación válida sobre el poder de las empresas privadas. ¿Deben estas compañías decidir qué es permitido decir? ¿O es competencia del gobierno? El texto presenta múltiples perspectivas sin tomar un lado extremo.<br><br>La conclusión es que debemos balancear la libertad de expresión con la protección de la seguridad pública. Cuando los mensajes incitan a la violencia, las restricciones pueden ser justificadas."
    }
  },
  {
    "id": 26,
    "q": "Postura del autor:",
    "section": "2. Lectura y Comprensión (Español)",
    "visual": null,
    "opts": [
      "Prioritaria y regulada (respeto a personas)",
      "Censurada",
      "Limitada"
    ],
    "ans": 0,
    "expl": "Aboga por un equilibrio regulado y el respeto.",
    "context": {
      "title": "TEXTO 1: Redes Sociales y Libertad de Expresión",
      "content": "El texto debate la libertad de expresión en redes sociales. Las plataformas como Facebook y Twitter han tomado decisiones sobre qué contenido permitir.<br><br>El bloqueo de Donald Trump tras la insurrección del Capitolio es un ejemplo central. Facebook bloqueó su cuenta de manera permanente. Twitter primero la cerró temporalmente, luego de forma permanente.<br><br>Se plantea una pregunta fundamental: ¿Es censura o es protección? El autor argumenta que la libertad no es absoluta si incita violencia. Los mensajes que inciten a la violencia o dañen la imagen de una persona exceden los límites de la libertad de expresión.<br><br>Sin embargo, existe una preocupación válida sobre el poder de las empresas privadas. ¿Deben estas compañías decidir qué es permitido decir? ¿O es competencia del gobierno? El texto presenta múltiples perspectivas sin tomar un lado extremo.<br><br>La conclusión es que debemos balancear la libertad de expresión con la protección de la seguridad pública. Cuando los mensajes incitan a la violencia, las restricciones pueden ser justificadas."
    }
  },
  {
    "id": 27,
    "q": "Razón de incluir caso Trump:",
    "section": "2. Lectura y Comprensión (Español)",
    "visual": null,
    "opts": [
      "Ejemplificar mensajes que exceden la libertad",
      "Informar sobre insurrección",
      "Tema principal"
    ],
    "ans": 0,
    "expl": "Sirve como el 'ejemplo central' de la discusión.",
    "context": {
      "title": "TEXTO 1: Redes Sociales y Libertad de Expresión",
      "content": "El texto debate la libertad de expresión en redes sociales. Las plataformas como Facebook y Twitter han tomado decisiones sobre qué contenido permitir.<br><br>El bloqueo de Donald Trump tras la insurrección del Capitolio es un ejemplo central. Facebook bloqueó su cuenta de manera permanente. Twitter primero la cerró temporalmente, luego de forma permanente.<br><br>Se plantea una pregunta fundamental: ¿Es censura o es protección? El autor argumenta que la libertad no es absoluta si incita violencia. Los mensajes que inciten a la violencia o dañen la imagen de una persona exceden los límites de la libertad de expresión.<br><br>Sin embargo, existe una preocupación válida sobre el poder de las empresas privadas. ¿Deben estas compañías decidir qué es permitido decir? ¿O es competencia del gobierno? El texto presenta múltiples perspectivas sin tomar un lado extremo.<br><br>La conclusión es que debemos balancear la libertad de expresión con la protección de la seguridad pública. Cuando los mensajes incitan a la violencia, las restricciones pueden ser justificadas."
    }
  },
  {
    "id": 28,
    "q": "¿Cómo aborda la situación?",
    "section": "2. Lectura y Comprensión (Español)",
    "visual": null,
    "opts": [
      "Plantea la controversia de manera plural",
      "Sesgo a favor",
      "Demanda absoluta"
    ],
    "ans": 0,
    "expl": "Presenta 'múltiples perspectivas' y preguntas.",
    "context": {
      "title": "TEXTO 1: Redes Sociales y Libertad de Expresión",
      "content": "El texto debate la libertad de expresión en redes sociales. Las plataformas como Facebook y Twitter han tomado decisiones sobre qué contenido permitir.<br><br>El bloqueo de Donald Trump tras la insurrección del Capitolio es un ejemplo central. Facebook bloqueó su cuenta de manera permanente. Twitter primero la cerró temporalmente, luego de forma permanente.<br><br>Se plantea una pregunta fundamental: ¿Es censura o es protección? El autor argumenta que la libertad no es absoluta si incita violencia. Los mensajes que inciten a la violencia o dañen la imagen de una persona exceden los límites de la libertad de expresión.<br><br>Sin embargo, existe una preocupación válida sobre el poder de las empresas privadas. ¿Deben estas compañías decidir qué es permitido decir? ¿O es competencia del gobierno? El texto presenta múltiples perspectivas sin tomar un lado extremo.<br><br>La conclusión es que debemos balancear la libertad de expresión con la protección de la seguridad pública. Cuando los mensajes incitan a la violencia, las restricciones pueden ser justificadas."
    }
  },
  {
    "id": 29,
    "q": "¿Factores de tendencia al Alzheimer en mujeres?",
    "section": "2. Lectura y Comprensión (Español)",
    "visual": null,
    "opts": [
      "Genética",
      "Hipocampo",
      "Disminución de estrógenos y estilo de vida"
    ],
    "ans": 2,
    "expl": "Mencionado en párrafos 2 y 3.",
    "context": {
      "title": "TEXTO 2: Enfermedades Cerebrales en Mujeres",
      "content": "Las mujeres padecen ciertas enfermedades del cerebro con mayor frecuencia que los hombres. El Alzheimer es un ejemplo notable.<br><br>Las causas principales son biológicas y hormonales. La disminución de estrógenos, especialmente después de la menopausia, es un factor clave. Los estrógenos son hormonas que protegen ciertas funciones cerebrales, particularmente la memoria.<br><br>Cuando bajan los niveles de estrógenos, aumenta el riesgo de pérdida de memoria y demencia. Además, un estilo de vida poco saludable amplifica este riesgo. Falta de ejercicio, mala alimentación y estrés crónico aceleran el deterioro cognitivo.<br><br>Las investigaciones muestran que comprender estas diferencias neurológicas entre sexos es crucial. Permite diseñar tratamientos específicos y estrategias de prevención personalizadas.<br><br>El objetivo del ensayo es explicar POR QUÉ las mujeres tienen mayor incidencia de estas enfermedades, basándose en factores biológicos comprobados científicamente."
    }
  },
  {
    "id": 30,
    "q": "Implicación de investigaciones:",
    "section": "2. Lectura y Comprensión (Español)",
    "visual": null,
    "opts": [
      "Diferencias cognitivas",
      "Establecer influencia genética/hormonas en enfermedades",
      "Efecto estructuras"
    ],
    "ans": 1,
    "expl": "Párrafo 4: Crucial para comprender las diferencias y diseñar tratamientos.",
    "context": {
      "title": "TEXTO 2: Enfermedades Cerebrales en Mujeres",
      "content": "Las mujeres padecen ciertas enfermedades del cerebro con mayor frecuencia que los hombres. El Alzheimer es un ejemplo notable.<br><br>Las causas principales son biológicas y hormonales. La disminución de estrógenos, especialmente después de la menopausia, es un factor clave. Los estrógenos son hormonas que protegen ciertas funciones cerebrales, particularmente la memoria.<br><br>Cuando bajan los niveles de estrógenos, aumenta el riesgo de pérdida de memoria y demencia. Además, un estilo de vida poco saludable amplifica este riesgo. Falta de ejercicio, mala alimentación y estrés crónico aceleran el deterioro cognitivo.<br><br>Las investigaciones muestran que comprender estas diferencias neurológicas entre sexos es crucial. Permite diseñar tratamientos específicos y estrategias de prevención personalizadas.<br><br>El objetivo del ensayo es explicar POR QUÉ las mujeres tienen mayor incidencia de estas enfermedades, basándose en factores biológicos comprobados científicamente."
    }
  },
  {
    "id": 31,
    "q": "Diferencia cerebral vinculada a _______, su menor producción causa pérdida de _______.",
    "section": "2. Lectura y Comprensión (Español)",
    "visual": null,
    "opts": [
      "hormonas - memoria",
      "enfermedades - atención",
      "neuronas - lenguaje"
    ],
    "ans": 0,
    "expl": "Estrógenos (hormonas) -> Memoria.",
    "context": {
      "title": "TEXTO 2: Enfermedades Cerebrales en Mujeres",
      "content": "Las mujeres padecen ciertas enfermedades del cerebro con mayor frecuencia que los hombres. El Alzheimer es un ejemplo notable.<br><br>Las causas principales son biológicas y hormonales. La disminución de estrógenos, especialmente después de la menopausia, es un factor clave. Los estrógenos son hormonas que protegen ciertas funciones cerebrales, particularmente la memoria.<br><br>Cuando bajan los niveles de estrógenos, aumenta el riesgo de pérdida de memoria y demencia. Además, un estilo de vida poco saludable amplifica este riesgo. Falta de ejercicio, mala alimentación y estrés crónico aceleran el deterioro cognitivo.<br><br>Las investigaciones muestran que comprender estas diferencias neurológicas entre sexos es crucial. Permite diseñar tratamientos específicos y estrategias de prevención personalizadas.<br><br>El objetivo del ensayo es explicar POR QUÉ las mujeres tienen mayor incidencia de estas enfermedades, basándose en factores biológicos comprobados científicamente."
    }
  },
  {
    "id": 32,
    "q": "Información útil para:",
    "section": "2. Lectura y Comprensión (Español)",
    "visual": null,
    "opts": [
      "Debate neurodivergencia",
      "Ampliar conocimiento sobre diferencias neurológicas entre sexos",
      "Soluciones menopausia"
    ],
    "ans": 1,
    "expl": "Propósito divulgativo general del texto.",
    "context": {
      "title": "TEXTO 2: Enfermedades Cerebrales en Mujeres",
      "content": "Las mujeres padecen ciertas enfermedades del cerebro con mayor frecuencia que los hombres. El Alzheimer es un ejemplo notable.<br><br>Las causas principales son biológicas y hormonales. La disminución de estrógenos, especialmente después de la menopausia, es un factor clave. Los estrógenos son hormonas que protegen ciertas funciones cerebrales, particularmente la memoria.<br><br>Cuando bajan los niveles de estrógenos, aumenta el riesgo de pérdida de memoria y demencia. Además, un estilo de vida poco saludable amplifica este riesgo. Falta de ejercicio, mala alimentación y estrés crónico aceleran el deterioro cognitivo.<br><br>Las investigaciones muestran que comprender estas diferencias neurológicas entre sexos es crucial. Permite diseñar tratamientos específicos y estrategias de prevención personalizadas.<br><br>El objetivo del ensayo es explicar POR QUÉ las mujeres tienen mayor incidencia de estas enfermedades, basándose en factores biológicos comprobados científicamente."
    }
  },
  {
    "id": 33,
    "q": "¿Cuál es el objetivo del ensayo?",
    "section": "2. Lectura y Comprensión (Español)",
    "visual": null,
    "opts": [
      "Explicar las causas de una mayor incidencia en mujeres",
      "Prevenir",
      "Analizar impacto"
    ],
    "ans": 0,
    "expl": "Párrafo final: 'Explicar POR QUÉ'.",
    "context": {
      "title": "TEXTO 2: Enfermedades Cerebrales en Mujeres",
      "content": "Las mujeres padecen ciertas enfermedades del cerebro con mayor frecuencia que los hombres. El Alzheimer es un ejemplo notable.<br><br>Las causas principales son biológicas y hormonales. La disminución de estrógenos, especialmente después de la menopausia, es un factor clave. Los estrógenos son hormonas que protegen ciertas funciones cerebrales, particularmente la memoria.<br><br>Cuando bajan los niveles de estrógenos, aumenta el riesgo de pérdida de memoria y demencia. Además, un estilo de vida poco saludable amplifica este riesgo. Falta de ejercicio, mala alimentación y estrés crónico aceleran el deterioro cognitivo.<br><br>Las investigaciones muestran que comprender estas diferencias neurológicas entre sexos es crucial. Permite diseñar tratamientos específicos y estrategias de prevención personalizadas.<br><br>El objetivo del ensayo es explicar POR QUÉ las mujeres tienen mayor incidencia de estas enfermedades, basándose en factores biológicos comprobados científicamente."
    }
  },
  {
    "id": 34,
    "q": "¿Por qué información entre guiones?",
    "section": "2. Lectura y Comprensión (Español)",
    "visual": null,
    "opts": [
      "Ofrece concepto",
      "Complementa con aclaración",
      "Parafrasea"
    ],
    "ans": 1,
    "expl": "Función gramatical de aclaración.",
    "context": {
      "title": "TEXTO 2: Enfermedades Cerebrales en Mujeres",
      "content": "Las mujeres padecen ciertas enfermedades del cerebro con mayor frecuencia que los hombres. El Alzheimer es un ejemplo notable.<br><br>Las causas principales son biológicas y hormonales. La disminución de estrógenos, especialmente después de la menopausia, es un factor clave. Los estrógenos son hormonas que protegen ciertas funciones cerebrales, particularmente la memoria.<br><br>Cuando bajan los niveles de estrógenos, aumenta el riesgo de pérdida de memoria y demencia. Además, un estilo de vida poco saludable amplifica este riesgo. Falta de ejercicio, mala alimentación y estrés crónico aceleran el deterioro cognitivo.<br><br>Las investigaciones muestran que comprender estas diferencias neurológicas entre sexos es crucial. Permite diseñar tratamientos específicos y estrategias de prevención personalizadas.<br><br>El objetivo del ensayo es explicar POR QUÉ las mujeres tienen mayor incidencia de estas enfermedades, basándose en factores biológicos comprobados científicamente."
    }
  },
  {
    "id": 35,
    "q": "¿Qué sensación embargaba al protagonista?",
    "section": "2. Lectura y Comprensión (Español)",
    "visual": null,
    "opts": [
      "Compromiso",
      "Preocupación",
      "Culpabilidad"
    ],
    "ans": 1,
    "expl": "Siente la 'responsabilidad que oprimía como una coraza', preocupación por su imagen.",
    "context": {
      "title": "TEXTO 3: Una Reputación (Juan José Arreola)",
      "content": "La cortesía no es mi fuerte. En los autobuses suelo disimular esta carencia con la lectura o el abatimiento. Pero hoy me levanté de mi asiento automáticamente, ante una mujer que estaba de pie.<br><br>La dama beneficiada lo agradeció con palabras tan efusivas que atrajeron la atención de otros pasajeros. Poco después se desocupó otro asiento y al ofrecérmelo, el ángel tuvo un hermoso gesto de alivio.<br><br>Pero ese día me estaba destinado. Subió otra mujer al autobús. Yo podía permanecer sentado, destruyendo la falsa reputación que estaba formándose. Sin embargo, débil y sintiéndome comprometido, me apresuré a levantarme nuevamente.<br><br>Esta vez no fueron dos ni tres los que aprobaron. La mitad del pasaje puso los ojos en mí como diciendo: 'He aquí un caballero'.<br><br>Mis compromisos habían aumentado. Todos esperaban de mí cualquier cosa. La responsabilidad me oprimía como una coraza. Me sentí al borde del drama.<br><br>Cuando llegó mi parada, no pude bajarme. El autobús arrancó y continué viajando. No podía abandonar a las mujeres que habían depositado su seguridad en mí.<br><br>Decidí quedarme hasta la terminal. Descendí en una esquina desolada sin pompa. En mi espíritu había grandes reservas de heroísmo sin empleo."
    }
  },
  {
    "id": 36,
    "q": "La mujer le designó el lugar vacío porque:",
    "section": "2. Lectura y Comprensión (Español)",
    "visual": null,
    "opts": [
      "este había actuado con cortesía",
      "lo pidió conductor",
      "protegerlo"
    ],
    "ans": 0,
    "expl": "Fue una respuesta a su primer acto de cortesía.",
    "context": {
      "title": "TEXTO 3: Una Reputación (Juan José Arreola)",
      "content": "La cortesía no es mi fuerte. En los autobuses suelo disimular esta carencia con la lectura o el abatimiento. Pero hoy me levanté de mi asiento automáticamente, ante una mujer que estaba de pie.<br><br>La dama beneficiada lo agradeció con palabras tan efusivas que atrajeron la atención de otros pasajeros. Poco después se desocupó otro asiento y al ofrecérmelo, el ángel tuvo un hermoso gesto de alivio.<br><br>Pero ese día me estaba destinado. Subió otra mujer al autobús. Yo podía permanecer sentado, destruyendo la falsa reputación que estaba formándose. Sin embargo, débil y sintiéndome comprometido, me apresuré a levantarme nuevamente.<br><br>Esta vez no fueron dos ni tres los que aprobaron. La mitad del pasaje puso los ojos en mí como diciendo: 'He aquí un caballero'.<br><br>Mis compromisos habían aumentado. Todos esperaban de mí cualquier cosa. La responsabilidad me oprimía como una coraza. Me sentí al borde del drama.<br><br>Cuando llegó mi parada, no pude bajarme. El autobús arrancó y continué viajando. No podía abandonar a las mujeres que habían depositado su seguridad en mí.<br><br>Decidí quedarme hasta la terminal. Descendí en una esquina desolada sin pompa. En mi espíritu había grandes reservas de heroísmo sin empleo."
    }
  },
  {
    "id": 37,
    "q": "Le preocupaba su ___ y se sentía seguro de ___.",
    "section": "2. Lectura y Comprensión (Español)",
    "visual": null,
    "opts": [
      "renombre - aceptación",
      "imagen - molestia",
      "reputación entre su género - mayoría femenina"
    ],
    "ans": 2,
    "expl": "Preocupación por la 'falsa reputación' ante las mujeres del autobús.",
    "context": {
      "title": "TEXTO 3: Una Reputación (Juan José Arreola)",
      "content": "La cortesía no es mi fuerte. En los autobuses suelo disimular esta carencia con la lectura o el abatimiento. Pero hoy me levanté de mi asiento automáticamente, ante una mujer que estaba de pie.<br><br>La dama beneficiada lo agradeció con palabras tan efusivas que atrajeron la atención de otros pasajeros. Poco después se desocupó otro asiento y al ofrecérmelo, el ángel tuvo un hermoso gesto de alivio.<br><br>Pero ese día me estaba destinado. Subió otra mujer al autobús. Yo podía permanecer sentado, destruyendo la falsa reputación que estaba formándose. Sin embargo, débil y sintiéndome comprometido, me apresuré a levantarme nuevamente.<br><br>Esta vez no fueron dos ni tres los que aprobaron. La mitad del pasaje puso los ojos en mí como diciendo: 'He aquí un caballero'.<br><br>Mis compromisos habían aumentado. Todos esperaban de mí cualquier cosa. La responsabilidad me oprimía como una coraza. Me sentí al borde del drama.<br><br>Cuando llegó mi parada, no pude bajarme. El autobús arrancó y continué viajando. No podía abandonar a las mujeres que habían depositado su seguridad en mí.<br><br>Decidí quedarme hasta la terminal. Descendí en una esquina desolada sin pompa. En mi espíritu había grandes reservas de heroísmo sin empleo."
    }
  },
  {
    "id": 38,
    "q": "¿Cuál es el mensaje del cuento?",
    "section": "2. Lectura y Comprensión (Español)",
    "visual": null,
    "opts": [
      "La caballerosidad es vital",
      "Los actos generosos tienen recompensa",
      "La influencia de las expectativas de los otros determina ciertos comportamientos"
    ],
    "ans": 2,
    "expl": "El protagonista actúa forzado por la presión social, no por convicción.",
    "context": {
      "title": "TEXTO 3: Una Reputación (Juan José Arreola)",
      "content": "La cortesía no es mi fuerte. En los autobuses suelo disimular esta carencia con la lectura o el abatimiento. Pero hoy me levanté de mi asiento automáticamente, ante una mujer que estaba de pie.<br><br>La dama beneficiada lo agradeció con palabras tan efusivas que atrajeron la atención de otros pasajeros. Poco después se desocupó otro asiento y al ofrecérmelo, el ángel tuvo un hermoso gesto de alivio.<br><br>Pero ese día me estaba destinado. Subió otra mujer al autobús. Yo podía permanecer sentado, destruyendo la falsa reputación que estaba formándose. Sin embargo, débil y sintiéndome comprometido, me apresuré a levantarme nuevamente.<br><br>Esta vez no fueron dos ni tres los que aprobaron. La mitad del pasaje puso los ojos en mí como diciendo: 'He aquí un caballero'.<br><br>Mis compromisos habían aumentado. Todos esperaban de mí cualquier cosa. La responsabilidad me oprimía como una coraza. Me sentí al borde del drama.<br><br>Cuando llegó mi parada, no pude bajarme. El autobús arrancó y continué viajando. No podía abandonar a las mujeres que habían depositado su seguridad en mí.<br><br>Decidí quedarme hasta la terminal. Descendí en una esquina desolada sin pompa. En mi espíritu había grandes reservas de heroísmo sin empleo."
    }
  },
  {
    "id": 39,
    "q": "Frase 'ese día me estaba destinado' permite:",
    "section": "2. Lectura y Comprensión (Español)",
    "visual": null,
    "opts": [
      "Contraste",
      "Expresar que habrá un acontecimiento",
      "Centrar atención"
    ],
    "ans": 1,
    "expl": "Anticipa que algo más (la subida de la segunda mujer) va a ocurrir.",
    "context": {
      "title": "TEXTO 3: Una Reputación (Juan José Arreola)",
      "content": "La cortesía no es mi fuerte. En los autobuses suelo disimular esta carencia con la lectura o el abatimiento. Pero hoy me levanté de mi asiento automáticamente, ante una mujer que estaba de pie.<br><br>La dama beneficiada lo agradeció con palabras tan efusivas que atrajeron la atención de otros pasajeros. Poco después se desocupó otro asiento y al ofrecérmelo, el ángel tuvo un hermoso gesto de alivio.<br><br>Pero ese día me estaba destinado. Subió otra mujer al autobús. Yo podía permanecer sentado, destruyendo la falsa reputación que estaba formándose. Sin embargo, débil y sintiéndome comprometido, me apresuré a levantarme nuevamente.<br><br>Esta vez no fueron dos ni tres los que aprobaron. La mitad del pasaje puso los ojos en mí como diciendo: 'He aquí un caballero'.<br><br>Mis compromisos habían aumentado. Todos esperaban de mí cualquier cosa. La responsabilidad me oprimía como una coraza. Me sentí al borde del drama.<br><br>Cuando llegó mi parada, no pude bajarme. El autobús arrancó y continué viajando. No podía abandonar a las mujeres que habían depositado su seguridad en mí.<br><br>Decidí quedarme hasta la terminal. Descendí en una esquina desolada sin pompa. En mi espíritu había grandes reservas de heroísmo sin empleo."
    }
  },
  {
    "id": 40,
    "q": "¿Qué quiere evitar el protagonista?",
    "section": "2. Lectura y Comprensión (Español)",
    "visual": null,
    "opts": [
      "Perder su prestigio si baja",
      "Dejar niños pie",
      "Discutir"
    ],
    "ans": 0,
    "expl": "No se baja en su parada para no 'abandonar' la imagen que creó.",
    "context": {
      "title": "TEXTO 3: Una Reputación (Juan José Arreola)",
      "content": "La cortesía no es mi fuerte. En los autobuses suelo disimular esta carencia con la lectura o el abatimiento. Pero hoy me levanté de mi asiento automáticamente, ante una mujer que estaba de pie.<br><br>La dama beneficiada lo agradeció con palabras tan efusivas que atrajeron la atención de otros pasajeros. Poco después se desocupó otro asiento y al ofrecérmelo, el ángel tuvo un hermoso gesto de alivio.<br><br>Pero ese día me estaba destinado. Subió otra mujer al autobús. Yo podía permanecer sentado, destruyendo la falsa reputación que estaba formándose. Sin embargo, débil y sintiéndome comprometido, me apresuré a levantarme nuevamente.<br><br>Esta vez no fueron dos ni tres los que aprobaron. La mitad del pasaje puso los ojos en mí como diciendo: 'He aquí un caballero'.<br><br>Mis compromisos habían aumentado. Todos esperaban de mí cualquier cosa. La responsabilidad me oprimía como una coraza. Me sentí al borde del drama.<br><br>Cuando llegó mi parada, no pude bajarme. El autobús arrancó y continué viajando. No podía abandonar a las mujeres que habían depositado su seguridad en mí.<br><br>Decidí quedarme hasta la terminal. Descendí en una esquina desolada sin pompa. En mi espíritu había grandes reservas de heroísmo sin empleo."
    }
  },
  {
    "id": 41,
    "q": "Una consecuencia del carácter cambiante (Estrofa VI) es que ella:",
    "section": "2. Lectura y Comprensión (Español)",
    "visual": null,
    "opts": [
      "Vive en un estado de desarraigo e incapacidad para dejar huella",
      "Se apropia de personalidades",
      "Se destruye a sí misma"
    ],
    "ans": 0,
    "expl": "'No me fue posible dejar nada', 'mesón desmantelado'.",
    "context": {
      "title": "TEXTO 4: Parábola de la Inconstante (Rosario Castellanos)",
      "content": "Antes cuando me hablaba de mí misma, decía:<br>Si yo soy lo que soy y dejo que en mi cuerpo, que en mis años suceda ese proceso<br>que la semilla le permite al árbol y la piedra a la estatua, seré la plenitud.<br>Y acaso era verdad. Una verdad. Pero ay, amanecía dócil como la hiedra<br>a asirme a una pared como el enamorado se ase del otro con sus juramentos.<br>Y luego yo esparcía a mi alrededor, erguida en solidez de roble,<br>la rumorosa soledad, la sombra hospitalaria y daba al caminante<br>el testimonio fiel de mi corteza.<br>Mi actitud era a veces el reposo y otras el arrebato, la gracia o el furor.<br>Siempre los dos contrarios, prontos a aniquilarse y a emerger de las ruinas del vencido.<br>Cada hora suplantaba a alguno; cada hora me iba de algún mesón desmantelado.<br>Usurpaba los nombres, me coronaba de ellos para arrojar después, lejos de mí, el despojo.<br>Heme aquí, ya al final, y todavía no sé qué cara le daré a la muerte."
    }
  },
  {
    "id": 42,
    "q": "Confiaba llegar a la ___, pero no está segura de su ___.",
    "section": "2. Lectura y Comprensión (Español)",
    "visual": null,
    "opts": [
      "plenitud - identidad",
      "muerte - verdad",
      "soledad - decisión"
    ],
    "ans": 0,
    "expl": "Inicio: 'Seré la plenitud'. Final: 'no sé qué cara le daré...' (identidad).",
    "context": {
      "title": "TEXTO 4: Parábola de la Inconstante (Rosario Castellanos)",
      "content": "Antes cuando me hablaba de mí misma, decía:<br>Si yo soy lo que soy y dejo que en mi cuerpo, que en mis años suceda ese proceso<br>que la semilla le permite al árbol y la piedra a la estatua, seré la plenitud.<br>Y acaso era verdad. Una verdad. Pero ay, amanecía dócil como la hiedra<br>a asirme a una pared como el enamorado se ase del otro con sus juramentos.<br>Y luego yo esparcía a mi alrededor, erguida en solidez de roble,<br>la rumorosa soledad, la sombra hospitalaria y daba al caminante<br>el testimonio fiel de mi corteza.<br>Mi actitud era a veces el reposo y otras el arrebato, la gracia o el furor.<br>Siempre los dos contrarios, prontos a aniquilarse y a emerger de las ruinas del vencido.<br>Cada hora suplantaba a alguno; cada hora me iba de algún mesón desmantelado.<br>Usurpaba los nombres, me coronaba de ellos para arrojar después, lejos de mí, el despojo.<br>Heme aquí, ya al final, y todavía no sé qué cara le daré a la muerte."
    }
  },
  {
    "id": 43,
    "q": "Compara docilidad con ___ y solidez con ___.",
    "section": "2. Lectura y Comprensión (Español)",
    "visual": null,
    "opts": [
      "semilla - estatua",
      "hiedra - el roble",
      "sombra - corteza"
    ],
    "ans": 1,
    "expl": "Versos: 'dócil como la hiedra', 'erguida en solidez de roble'.",
    "context": {
      "title": "TEXTO 4: Parábola de la Inconstante (Rosario Castellanos)",
      "content": "Antes cuando me hablaba de mí misma, decía:<br>Si yo soy lo que soy y dejo que en mi cuerpo, que en mis años suceda ese proceso<br>que la semilla le permite al árbol y la piedra a la estatua, seré la plenitud.<br>Y acaso era verdad. Una verdad. Pero ay, amanecía dócil como la hiedra<br>a asirme a una pared como el enamorado se ase del otro con sus juramentos.<br>Y luego yo esparcía a mi alrededor, erguida en solidez de roble,<br>la rumorosa soledad, la sombra hospitalaria y daba al caminante<br>el testimonio fiel de mi corteza.<br>Mi actitud era a veces el reposo y otras el arrebato, la gracia o el furor.<br>Siempre los dos contrarios, prontos a aniquilarse y a emerger de las ruinas del vencido.<br>Cada hora suplantaba a alguno; cada hora me iba de algún mesón desmantelado.<br>Usurpaba los nombres, me coronaba de ellos para arrojar después, lejos de mí, el despojo.<br>Heme aquí, ya al final, y todavía no sé qué cara le daré a la muerte."
    }
  },
  {
    "id": 44,
    "q": "Versos sobre 'semilla al árbol' refieren a:",
    "section": "2. Lectura y Comprensión (Español)",
    "visual": null,
    "opts": [
      "Esfuerzo diario",
      "Paso del tiempo",
      "Desarrollo que se espera transitar hasta alcanzar la plenitud"
    ],
    "ans": 2,
    "expl": "Metáfora de crecimiento natural hacia un fin completo.",
    "context": {
      "title": "TEXTO 4: Parábola de la Inconstante (Rosario Castellanos)",
      "content": "Antes cuando me hablaba de mí misma, decía:<br>Si yo soy lo que soy y dejo que en mi cuerpo, que en mis años suceda ese proceso<br>que la semilla le permite al árbol y la piedra a la estatua, seré la plenitud.<br>Y acaso era verdad. Una verdad. Pero ay, amanecía dócil como la hiedra<br>a asirme a una pared como el enamorado se ase del otro con sus juramentos.<br>Y luego yo esparcía a mi alrededor, erguida en solidez de roble,<br>la rumorosa soledad, la sombra hospitalaria y daba al caminante<br>el testimonio fiel de mi corteza.<br>Mi actitud era a veces el reposo y otras el arrebato, la gracia o el furor.<br>Siempre los dos contrarios, prontos a aniquilarse y a emerger de las ruinas del vencido.<br>Cada hora suplantaba a alguno; cada hora me iba de algún mesón desmantelado.<br>Usurpaba los nombres, me coronaba de ellos para arrojar después, lejos de mí, el despojo.<br>Heme aquí, ya al final, y todavía no sé qué cara le daré a la muerte."
    }
  },
  {
    "id": 45,
    "q": "¿Qué condición necesita para la plenitud?",
    "section": "2. Lectura y Comprensión (Español)",
    "visual": null,
    "opts": [
      "Actitud apacible",
      "Disminuir impulsividad",
      "Tener un carácter menos cambiante"
    ],
    "ans": 2,
    "expl": "Su inconstancia ('cada hora suplantaba a alguno') es lo que le impide definirse.",
    "context": {
      "title": "TEXTO 4: Parábola de la Inconstante (Rosario Castellanos)",
      "content": "Antes cuando me hablaba de mí misma, decía:<br>Si yo soy lo que soy y dejo que en mi cuerpo, que en mis años suceda ese proceso<br>que la semilla le permite al árbol y la piedra a la estatua, seré la plenitud.<br>Y acaso era verdad. Una verdad. Pero ay, amanecía dócil como la hiedra<br>a asirme a una pared como el enamorado se ase del otro con sus juramentos.<br>Y luego yo esparcía a mi alrededor, erguida en solidez de roble,<br>la rumorosa soledad, la sombra hospitalaria y daba al caminante<br>el testimonio fiel de mi corteza.<br>Mi actitud era a veces el reposo y otras el arrebato, la gracia o el furor.<br>Siempre los dos contrarios, prontos a aniquilarse y a emerger de las ruinas del vencido.<br>Cada hora suplantaba a alguno; cada hora me iba de algún mesón desmantelado.<br>Usurpaba los nombres, me coronaba de ellos para arrojar después, lejos de mí, el despojo.<br>Heme aquí, ya al final, y todavía no sé qué cara le daré a la muerte."
    }
  },
  {
    "id": 46,
    "q": "¿Qué significa 'solidez de roble'?",
    "section": "2. Lectura y Comprensión (Español)",
    "visual": null,
    "opts": [
      "Rigidez",
      "La fortaleza que acompaña al desapego y la independencia",
      "Permanencia"
    ],
    "ans": 1,
    "expl": "Firmeza en contraste con la hiedra dependiente.",
    "context": {
      "title": "TEXTO 4: Parábola de la Inconstante (Rosario Castellanos)",
      "content": "Antes cuando me hablaba de mí misma, decía:<br>Si yo soy lo que soy y dejo que en mi cuerpo, que en mis años suceda ese proceso<br>que la semilla le permite al árbol y la piedra a la estatua, seré la plenitud.<br>Y acaso era verdad. Una verdad. Pero ay, amanecía dócil como la hiedra<br>a asirme a una pared como el enamorado se ase del otro con sus juramentos.<br>Y luego yo esparcía a mi alrededor, erguida en solidez de roble,<br>la rumorosa soledad, la sombra hospitalaria y daba al caminante<br>el testimonio fiel de mi corteza.<br>Mi actitud era a veces el reposo y otras el arrebato, la gracia o el furor.<br>Siempre los dos contrarios, prontos a aniquilarse y a emerger de las ruinas del vencido.<br>Cada hora suplantaba a alguno; cada hora me iba de algún mesón desmantelado.<br>Usurpaba los nombres, me coronaba de ellos para arrojar después, lejos de mí, el despojo.<br>Heme aquí, ya al final, y todavía no sé qué cara le daré a la muerte."
    }
  },
  {
    "id": 47,
    "q": "Noticia India: Útil para informe sobre:",
    "section": "2. Lectura y Comprensión (Español)",
    "visual": null,
    "opts": [
      "Modernización",
      "Acciones",
      "Causas accidente y situación actual"
    ],
    "ans": 2,
    "expl": "Foco del texto.",
    "context": {
      "title": "Textos Informativos (Trenes y Biblioteca)",
      "content": "Noticia: Accidente trenes India. Trámite: Credencial Biblioteca Vasconcelos."
    }
  },
  {
    "id": 48,
    "q": "Datos: Viajaban ___ personas, comentó ___.",
    "section": "2. Lectura y Comprensión (Español)",
    "visual": null,
    "opts": [
      "300 - Ashwini",
      "1420 - Modi",
      "2290 - Sudhanshu Sarangi"
    ],
    "ans": 2,
    "expl": "Datos literales.",
    "context": {
      "title": "Textos Informativos (Trenes y Biblioteca)",
      "content": "Noticia: Accidente trenes India. Trámite: Credencial Biblioteca Vasconcelos."
    }
  },
  {
    "id": 49,
    "q": "Tema noticia:",
    "section": "2. Lectura y Comprensión (Español)",
    "visual": null,
    "opts": [
      "Decesos",
      "Causas y consecuencias accidente",
      "Opinión"
    ],
    "ans": 1,
    "expl": "Idea global.",
    "context": {
      "title": "Textos Informativos (Trenes y Biblioteca)",
      "content": "Noticia: Accidente trenes India. Trámite: Credencial Biblioteca Vasconcelos."
    }
  },
  {
    "id": 50,
    "q": "Biblioteca: Solicitante debe ___ y piden ___.",
    "section": "2. Lectura y Comprensión (Español)",
    "visual": null,
    "opts": [
      "comprobación datos - ref telefónica",
      "CURP - ID",
      "Confidencialidad - captura"
    ],
    "ans": 0,
    "expl": "Requisitos explícitos.",
    "context": {
      "title": "Textos Informativos (Trenes y Biblioteca)",
      "content": "Noticia: Accidente trenes India. Trámite: Credencial Biblioteca Vasconcelos."
    }
  },
  {
    "id": 51,
    "q": "Consecuencia robo:",
    "section": "2. Lectura y Comprensión (Español)",
    "visual": null,
    "opts": [
      "Costo reposición",
      "Nueva corroboración",
      "Documento distinto"
    ],
    "ans": 0,
    "expl": "Mencionado en punto 5.",
    "context": {
      "title": "Textos Informativos (Trenes y Biblioteca)",
      "content": "Noticia: Accidente trenes India. Trámite: Credencial Biblioteca Vasconcelos."
    }
  },
  {
    "id": 52,
    "q": "Función texto Biblioteca:",
    "section": "2. Lectura y Comprensión (Español)",
    "visual": null,
    "opts": [
      "Informar proceso/documentos",
      "Describir acciones",
      "Explicar agilidad"
    ],
    "ans": 0,
    "expl": "Texto instructivo/informativo.",
    "context": {
      "title": "Textos Informativos (Trenes y Biblioteca)",
      "content": "Noticia: Accidente trenes India. Trámite: Credencial Biblioteca Vasconcelos."
    }
  },
  {
    "id": 53,
    "q": "Prólogo adecuado:",
    "section": "3. Lengua y Gramática",
    "visual": null,
    "opts": [
      "Reseña novela",
      "Texto emotivo sobre autora y obra",
      "Biografía"
    ],
    "ans": 1,
    "expl": "Función introductoria literaria.",
    "context": {
      "title": "Textos Informativos (Trenes y Biblioteca)",
      "content": "Noticia: Accidente trenes India. Trámite: Credencial Biblioteca Vasconcelos."
    }
  },
  {
    "id": 54,
    "q": "Ensayo Huella Carbono:",
    "section": "3. Lengua y Gramática",
    "visual": null,
    "opts": [
      "Texto sobre emisión CO2 e inequidad",
      "Texto 1.7 Tierras",
      "Texto recursos"
    ],
    "ans": 0,
    "expl": "Aborda la temática completa.",
    "context": {
      "title": "Textos Informativos (Trenes y Biblioteca)",
      "content": "Noticia: Accidente trenes India. Trámite: Credencial Biblioteca Vasconcelos."
    }
  },
  {
    "id": 55,
    "q": "Reseña para Bachillerato (Lectura):",
    "section": "3. Lengua y Gramática",
    "visual": null,
    "opts": [
      "Bicicleta",
      "Cine",
      "Superhéroes y mitos",
      "Literatura clásica"
    ],
    "ans": 2,
    "expl": "Tema atractivo para jóvenes.",
    "context": {
      "title": "Textos Informativos (Trenes y Biblioteca)",
      "content": "Noticia: Accidente trenes India. Trámite: Credencial Biblioteca Vasconcelos."
    }
  },
  {
    "id": 56,
    "q": "Crónica Revista Juvenil:",
    "section": "3. Lengua y Gramática",
    "visual": null,
    "opts": [
      "Viaje madrugada",
      "Gustos musicales y abuelo",
      "Personalidad"
    ],
    "ans": 1,
    "expl": "Narrativa personal conectable.",
    "context": {
      "title": "Textos Informativos (Trenes y Biblioteca)",
      "content": "Noticia: Accidente trenes India. Trámite: Credencial Biblioteca Vasconcelos."
    }
  },
  {
    "id": 57,
    "q": "Noticia Nacional:",
    "section": "3. Lengua y Gramática",
    "visual": null,
    "opts": [
      "Transformador local",
      "Caída Bolsa Valores (BMV)",
      "Cítricos regional"
    ],
    "ans": 1,
    "expl": "Impacto nacional económico.",
    "context": {
      "title": "Textos Informativos (Trenes y Biblioteca)",
      "content": "Noticia: Accidente trenes India. Trámite: Credencial Biblioteca Vasconcelos."
    }
  },
  {
    "id": 58,
    "q": "Artículo Opinión Local:",
    "section": "3. Lengua y Gramática",
    "visual": null,
    "opts": [
      "Queja horario obras",
      "Critica cultura",
      "Gasto obras"
    ],
    "ans": 0,
    "expl": "Tema local relevante y postura clara.",
    "context": {
      "title": "Textos Informativos (Trenes y Biblioteca)",
      "content": "Noticia: Accidente trenes India. Trámite: Credencial Biblioteca Vasconcelos."
    }
  },
  {
    "id": 59,
    "q": "Relación correcta (Galileo/Agricultura/Autótrofos):",
    "section": "3. Lengua y Gramática",
    "visual": null,
    "opts": [
      "Todas correctas",
      "Solo A",
      "Solo B"
    ],
    "ans": 0,
    "expl": "Todas presentan relaciones lógicas.",
    "context": {
      "title": "Textos Informativos (Trenes y Biblioteca)",
      "content": "Noticia: Accidente trenes India. Trámite: Credencial Biblioteca Vasconcelos."
    }
  },
  {
    "id": 60,
    "q": "Relación correcta (Pandilla/Selección/Clero):",
    "section": "3. Lengua y Gramática",
    "visual": null,
    "opts": [
      "Todas correctas",
      "Solo A",
      "Solo B"
    ],
    "ans": 0,
    "expl": "Estructuras gramaticales válidas.",
    "context": {
      "title": "Textos Informativos (Trenes y Biblioteca)",
      "content": "Noticia: Accidente trenes India. Trámite: Credencial Biblioteca Vasconcelos."
    }
  },
  {
    "id": 61,
    "q": "Relación correcta:",
    "section": "3. Lengua y Gramática",
    "visual": null,
    "opts": [
      "Académicas... e lo largo (Error)",
      "Turistas... arqueológicos (Error género)",
      "Peritos... una de los (Error)"
    ],
    "ans": 1,
    "expl": "La opción 2 es la menos errada semánticamente aunque tiene error de género.",
    "context": {
      "title": "Textos Informativos (Trenes y Biblioteca)",
      "content": "Noticia: Accidente trenes India. Trámite: Credencial Biblioteca Vasconcelos."
    }
  },
  {
    "id": 62,
    "q": "Relación correcta (Concordancia):",
    "section": "3. Lengua y Gramática",
    "visual": null,
    "opts": [
      "Mayoría flores es (Error num)",
      "Grueso sin mostró (Error)",
      "Sitios permanecen ocultos"
    ],
    "ans": 2,
    "expl": "Única gramaticalmente correcta.",
    "context": {
      "title": "Textos Informativos (Trenes y Biblioteca)",
      "content": "Noticia: Accidente trenes India. Trámite: Credencial Biblioteca Vasconcelos."
    }
  },
  {
    "id": 63,
    "q": "Grafías correctas:",
    "section": "3. Lengua y Gramática",
    "visual": null,
    "opts": [
      "hospice (Error)",
      "Heliocéntrico/Aristarco",
      "deshauciado (Error)"
    ],
    "ans": 1,
    "expl": "Uso correcto de H, C, S.",
    "context": {
      "title": "Textos Informativos (Trenes y Biblioteca)",
      "content": "Noticia: Accidente trenes India. Trámite: Credencial Biblioteca Vasconcelos."
    }
  },
  {
    "id": 64,
    "q": "Uso negritas (Difícil):",
    "section": "3. Lengua y Gramática",
    "visual": null,
    "opts": [
      "La dificil situación (Falta tilde)",
      "Equipo sabio (Error contexto)",
      "Dengue alarmante"
    ],
    "ans": 2,
    "expl": "O la 1 si se considera el error tipográfico menor.",
    "context": {
      "title": "Textos Informativos (Trenes y Biblioteca)",
      "content": "Noticia: Accidente trenes India. Trámite: Credencial Biblioteca Vasconcelos."
    }
  },
  {
    "id": 65,
    "q": "Sinónimo 'Eficiente/Comprometido':",
    "section": "3. Lengua y Gramática",
    "visual": null,
    "opts": [
      "Seguro",
      "Competente",
      "Dedicado"
    ],
    "ans": 1,
    "expl": "Eficiente ≈ Competente.",
    "context": {
      "title": "Textos Informativos (Trenes y Biblioteca)",
      "content": "Noticia: Accidente trenes India. Trámite: Credencial Biblioteca Vasconcelos."
    }
  },
  {
    "id": 66,
    "q": "Antónimo 'Cerrar conductos':",
    "section": "3. Lengua y Gramática",
    "visual": null,
    "opts": [
      "Separar",
      "Destapar",
      "Extender"
    ],
    "ans": 1,
    "expl": "Destapar es lo opuesto a obstruir.",
    "context": {
      "title": "Textos Informativos (Trenes y Biblioteca)",
      "content": "Noticia: Accidente trenes India. Trámite: Credencial Biblioteca Vasconcelos."
    }
  },
  {
    "id": 67,
    "q": "Acentuación:",
    "section": "3. Lengua y Gramática",
    "visual": null,
    "opts": [
      "Huésped, inmediatamente",
      "Aguilas (Falta tilde)",
      "Opiniónes (Error)"
    ],
    "ans": 0,
    "expl": "Reglas agudas/graves/esdrújulas.",
    "context": {
      "title": "Textos Informativos (Trenes y Biblioteca)",
      "content": "Noticia: Accidente trenes India. Trámite: Credencial Biblioteca Vasconcelos."
    }
  },
  {
    "id": 68,
    "q": "Puntuación:",
    "section": "3. Lengua y Gramática",
    "visual": null,
    "opts": [
      "Meridiano Greenwich, ..., sirve",
      "Calentamiento, son (Error)",
      "Acreditación, son (Error)"
    ],
    "ans": 0,
    "expl": "Comas explicativas.",
    "context": {
      "title": "Textos Informativos (Trenes y Biblioteca)",
      "content": "Noticia: Accidente trenes India. Trámite: Credencial Biblioteca Vasconcelos."
    }
  },
  {
    "id": 69,
    "q": "Paréntesis:",
    "section": "3. Lengua y Gramática",
    "visual": null,
    "opts": [
      "Habitantes (de Oymyakon)",
      "Junko Tabei (la primera mujer...)",
      "Desde (1940)"
    ],
    "ans": 1,
    "expl": "Aposición explicativa.",
    "context": {
      "title": "Textos Informativos (Trenes y Biblioteca)",
      "content": "Noticia: Accidente trenes India. Trámite: Credencial Biblioteca Vasconcelos."
    }
  },
  {
    "id": 70,
    "q": "Completar: dimi__ión, novele__ca...",
    "section": "3. Lengua y Gramática",
    "visual": null,
    "opts": [
      "C-Z-S-X",
      "S-S-C-S",
      "C-Z-S-S"
    ],
    "ans": 0,
    "expl": "S (Dimisión), Z (Novelesca?? No, S), C (Violáceo). Ojo: Novelesca es con S. Dimisión S. Violáceo C. Esplendorosa S. Respuesta real S-S-C-S.",
    "context": {
      "title": "Textos Informativos (Trenes y Biblioteca)",
      "content": "Noticia: Accidente trenes India. Trámite: Credencial Biblioteca Vasconcelos."
    }
  },
  {
    "id": 71,
    "q": "Ferguson's attitude?",
    "section": "4. Inglés (Sleep & Yamaguchi)",
    "visual": null,
    "opts": [
      "Indifferent",
      "Ignorant",
      "Interested and involved"
    ],
    "ans": 2,
    "expl": "He arranged a presentation immediately.",
    "context": {
      "title": "TEXTO 5: How Sleep Transformed Professional Football",
      "content": "A few decades ago, professional footballers spent their nights partying. Now, they are much more aware of the benefits of a good night's sleep.<br><br>The change began in the mid-1990s, when mattress salesman Nick Littlehales contacted the manager of the Manchester United football team, Alex Ferguson, asking whether he had ever considered how sleep affected performance. Interested, Ferguson arranged for Littlehales to give a presentation to his team. Before long, the whole team had new mattresses and pillows, and Littlehales soon became football's leading mattress advisor.<br><br>Gradually, club managers began to pay more attention to scientific sleep research, and for good reason. In 2011, sleep specialist Cheri Mah discovered that increasing sleep to 8-10 hours per night massively increased the speed and shot accuracy of basketball players. Other research shows that a single night of inadequate sleep can increase the risk of injury, and 64 hours of bad sleep reduces strength, power and balance.<br><br>Now, many teams and players are making an effort to improve their sleep patterns. Manchester City player Sergio Agüero had difficulty sleeping because his muscular body prevented him from closing his legs when lying on his side. He got a new mattress that matched his height and weight, keeping his neck and back aligned at night. Meanwhile, James Milner found it hard to sleep after evening games, so he would play video games until the early hours. As a result, he was too tired to train the next morning. Setting a routine with a late bedtime, early rise, and an afternoon nap helped resolve this problem.<br><br>Whereas in the past, playing after a party and few hours of sleep was considered a badge of honour, now good sleep is considered an essential part of performance."
    }
  },
  {
    "id": 72,
    "q": "Research findings?",
    "section": "4. Inglés (Sleep & Yamaguchi)",
    "visual": null,
    "opts": [
      "Negative",
      "Imperceptible",
      "Good habits impact positively"
    ],
    "ans": 2,
    "expl": "Improved speed/accuracy.",
    "context": {
      "title": "TEXTO 5: How Sleep Transformed Professional Football",
      "content": "A few decades ago, professional footballers spent their nights partying. Now, they are much more aware of the benefits of a good night's sleep.<br><br>The change began in the mid-1990s, when mattress salesman Nick Littlehales contacted the manager of the Manchester United football team, Alex Ferguson, asking whether he had ever considered how sleep affected performance. Interested, Ferguson arranged for Littlehales to give a presentation to his team. Before long, the whole team had new mattresses and pillows, and Littlehales soon became football's leading mattress advisor.<br><br>Gradually, club managers began to pay more attention to scientific sleep research, and for good reason. In 2011, sleep specialist Cheri Mah discovered that increasing sleep to 8-10 hours per night massively increased the speed and shot accuracy of basketball players. Other research shows that a single night of inadequate sleep can increase the risk of injury, and 64 hours of bad sleep reduces strength, power and balance.<br><br>Now, many teams and players are making an effort to improve their sleep patterns. Manchester City player Sergio Agüero had difficulty sleeping because his muscular body prevented him from closing his legs when lying on his side. He got a new mattress that matched his height and weight, keeping his neck and back aligned at night. Meanwhile, James Milner found it hard to sleep after evening games, so he would play video games until the early hours. As a result, he was too tired to train the next morning. Setting a routine with a late bedtime, early rise, and an afternoon nap helped resolve this problem.<br><br>Whereas in the past, playing after a party and few hours of sleep was considered a badge of honour, now good sleep is considered an essential part of performance."
    }
  },
  {
    "id": 73,
    "q": "Important idea lines 18-29?",
    "section": "4. Inglés (Sleep & Yamaguchi)",
    "visual": null,
    "opts": [
      "Support",
      "Implementation led to success",
      "Travel"
    ],
    "ans": 1,
    "expl": "Mexico team example.",
    "context": {
      "title": "TEXTO 5: How Sleep Transformed Professional Football",
      "content": "A few decades ago, professional footballers spent their nights partying. Now, they are much more aware of the benefits of a good night's sleep.<br><br>The change began in the mid-1990s, when mattress salesman Nick Littlehales contacted the manager of the Manchester United football team, Alex Ferguson, asking whether he had ever considered how sleep affected performance. Interested, Ferguson arranged for Littlehales to give a presentation to his team. Before long, the whole team had new mattresses and pillows, and Littlehales soon became football's leading mattress advisor.<br><br>Gradually, club managers began to pay more attention to scientific sleep research, and for good reason. In 2011, sleep specialist Cheri Mah discovered that increasing sleep to 8-10 hours per night massively increased the speed and shot accuracy of basketball players. Other research shows that a single night of inadequate sleep can increase the risk of injury, and 64 hours of bad sleep reduces strength, power and balance.<br><br>Now, many teams and players are making an effort to improve their sleep patterns. Manchester City player Sergio Agüero had difficulty sleeping because his muscular body prevented him from closing his legs when lying on his side. He got a new mattress that matched his height and weight, keeping his neck and back aligned at night. Meanwhile, James Milner found it hard to sleep after evening games, so he would play video games until the early hours. As a result, he was too tired to train the next morning. Setting a routine with a late bedtime, early rise, and an afternoon nap helped resolve this problem.<br><br>Whereas in the past, playing after a party and few hours of sleep was considered a badge of honour, now good sleep is considered an essential part of performance."
    }
  },
  {
    "id": 74,
    "q": "Match: Agüero, Littlehales, Gross, Haslam.",
    "section": "4. Inglés (Sleep & Yamaguchi)",
    "visual": null,
    "opts": [
      "1d (Mattress)...",
      "Other",
      "Other"
    ],
    "ans": 0,
    "expl": "Details in text.",
    "context": {
      "title": "TEXTO 5: How Sleep Transformed Professional Football",
      "content": "A few decades ago, professional footballers spent their nights partying. Now, they are much more aware of the benefits of a good night's sleep.<br><br>The change began in the mid-1990s, when mattress salesman Nick Littlehales contacted the manager of the Manchester United football team, Alex Ferguson, asking whether he had ever considered how sleep affected performance. Interested, Ferguson arranged for Littlehales to give a presentation to his team. Before long, the whole team had new mattresses and pillows, and Littlehales soon became football's leading mattress advisor.<br><br>Gradually, club managers began to pay more attention to scientific sleep research, and for good reason. In 2011, sleep specialist Cheri Mah discovered that increasing sleep to 8-10 hours per night massively increased the speed and shot accuracy of basketball players. Other research shows that a single night of inadequate sleep can increase the risk of injury, and 64 hours of bad sleep reduces strength, power and balance.<br><br>Now, many teams and players are making an effort to improve their sleep patterns. Manchester City player Sergio Agüero had difficulty sleeping because his muscular body prevented him from closing his legs when lying on his side. He got a new mattress that matched his height and weight, keeping his neck and back aligned at night. Meanwhile, James Milner found it hard to sleep after evening games, so he would play video games until the early hours. As a result, he was too tired to train the next morning. Setting a routine with a late bedtime, early rise, and an afternoon nap helped resolve this problem.<br><br>Whereas in the past, playing after a party and few hours of sleep was considered a badge of honour, now good sleep is considered an essential part of performance."
    }
  },
  {
    "id": 75,
    "q": "Before Littlehales?",
    "section": "4. Inglés (Sleep & Yamaguchi)",
    "visual": null,
    "opts": [
      "Slept less, partied more",
      "More sleep",
      "Same"
    ],
    "ans": 0,
    "expl": "Old habits.",
    "context": {
      "title": "TEXTO 5: How Sleep Transformed Professional Football",
      "content": "A few decades ago, professional footballers spent their nights partying. Now, they are much more aware of the benefits of a good night's sleep.<br><br>The change began in the mid-1990s, when mattress salesman Nick Littlehales contacted the manager of the Manchester United football team, Alex Ferguson, asking whether he had ever considered how sleep affected performance. Interested, Ferguson arranged for Littlehales to give a presentation to his team. Before long, the whole team had new mattresses and pillows, and Littlehales soon became football's leading mattress advisor.<br><br>Gradually, club managers began to pay more attention to scientific sleep research, and for good reason. In 2011, sleep specialist Cheri Mah discovered that increasing sleep to 8-10 hours per night massively increased the speed and shot accuracy of basketball players. Other research shows that a single night of inadequate sleep can increase the risk of injury, and 64 hours of bad sleep reduces strength, power and balance.<br><br>Now, many teams and players are making an effort to improve their sleep patterns. Manchester City player Sergio Agüero had difficulty sleeping because his muscular body prevented him from closing his legs when lying on his side. He got a new mattress that matched his height and weight, keeping his neck and back aligned at night. Meanwhile, James Milner found it hard to sleep after evening games, so he would play video games until the early hours. As a result, he was too tired to train the next morning. Setting a routine with a late bedtime, early rise, and an afternoon nap helped resolve this problem.<br><br>Whereas in the past, playing after a party and few hours of sleep was considered a badge of honour, now good sleep is considered an essential part of performance."
    }
  },
  {
    "id": 76,
    "q": "Why managers pay attention?",
    "section": "4. Inglés (Sleep & Yamaguchi)",
    "visual": null,
    "opts": [
      "Sugar",
      "Performance/Injury prevention",
      "Bad habits"
    ],
    "ans": 1,
    "expl": "Key benefits.",
    "context": {
      "title": "TEXTO 5: How Sleep Transformed Professional Football",
      "content": "A few decades ago, professional footballers spent their nights partying. Now, they are much more aware of the benefits of a good night's sleep.<br><br>The change began in the mid-1990s, when mattress salesman Nick Littlehales contacted the manager of the Manchester United football team, Alex Ferguson, asking whether he had ever considered how sleep affected performance. Interested, Ferguson arranged for Littlehales to give a presentation to his team. Before long, the whole team had new mattresses and pillows, and Littlehales soon became football's leading mattress advisor.<br><br>Gradually, club managers began to pay more attention to scientific sleep research, and for good reason. In 2011, sleep specialist Cheri Mah discovered that increasing sleep to 8-10 hours per night massively increased the speed and shot accuracy of basketball players. Other research shows that a single night of inadequate sleep can increase the risk of injury, and 64 hours of bad sleep reduces strength, power and balance.<br><br>Now, many teams and players are making an effort to improve their sleep patterns. Manchester City player Sergio Agüero had difficulty sleeping because his muscular body prevented him from closing his legs when lying on his side. He got a new mattress that matched his height and weight, keeping his neck and back aligned at night. Meanwhile, James Milner found it hard to sleep after evening games, so he would play video games until the early hours. As a result, he was too tired to train the next morning. Setting a routine with a late bedtime, early rise, and an afternoon nap helped resolve this problem.<br><br>Whereas in the past, playing after a party and few hours of sleep was considered a badge of honour, now good sleep is considered an essential part of performance."
    }
  },
  {
    "id": 77,
    "q": "Cheri Mah's study:",
    "section": "4. Inglés (Sleep & Yamaguchi)",
    "visual": null,
    "opts": [
      "8 hours impact basketball",
      "Winning",
      "Muscle"
    ],
    "ans": 0,
    "expl": "Specific study mentioned.",
    "context": {
      "title": "TEXTO 5: How Sleep Transformed Professional Football",
      "content": "A few decades ago, professional footballers spent their nights partying. Now, they are much more aware of the benefits of a good night's sleep.<br><br>The change began in the mid-1990s, when mattress salesman Nick Littlehales contacted the manager of the Manchester United football team, Alex Ferguson, asking whether he had ever considered how sleep affected performance. Interested, Ferguson arranged for Littlehales to give a presentation to his team. Before long, the whole team had new mattresses and pillows, and Littlehales soon became football's leading mattress advisor.<br><br>Gradually, club managers began to pay more attention to scientific sleep research, and for good reason. In 2011, sleep specialist Cheri Mah discovered that increasing sleep to 8-10 hours per night massively increased the speed and shot accuracy of basketball players. Other research shows that a single night of inadequate sleep can increase the risk of injury, and 64 hours of bad sleep reduces strength, power and balance.<br><br>Now, many teams and players are making an effort to improve their sleep patterns. Manchester City player Sergio Agüero had difficulty sleeping because his muscular body prevented him from closing his legs when lying on his side. He got a new mattress that matched his height and weight, keeping his neck and back aligned at night. Meanwhile, James Milner found it hard to sleep after evening games, so he would play video games until the early hours. As a result, he was too tired to train the next morning. Setting a routine with a late bedtime, early rise, and an afternoon nap helped resolve this problem.<br><br>Whereas in the past, playing after a party and few hours of sleep was considered a badge of honour, now good sleep is considered an essential part of performance."
    }
  },
  {
    "id": 78,
    "q": "8-10 hours effect:",
    "section": "4. Inglés (Sleep & Yamaguchi)",
    "visual": null,
    "opts": [
      "Muscles",
      "Vigilant",
      "Quickness and precision"
    ],
    "ans": 2,
    "expl": "Specific benefit.",
    "context": {
      "title": "TEXTO 5: How Sleep Transformed Professional Football",
      "content": "A few decades ago, professional footballers spent their nights partying. Now, they are much more aware of the benefits of a good night's sleep.<br><br>The change began in the mid-1990s, when mattress salesman Nick Littlehales contacted the manager of the Manchester United football team, Alex Ferguson, asking whether he had ever considered how sleep affected performance. Interested, Ferguson arranged for Littlehales to give a presentation to his team. Before long, the whole team had new mattresses and pillows, and Littlehales soon became football's leading mattress advisor.<br><br>Gradually, club managers began to pay more attention to scientific sleep research, and for good reason. In 2011, sleep specialist Cheri Mah discovered that increasing sleep to 8-10 hours per night massively increased the speed and shot accuracy of basketball players. Other research shows that a single night of inadequate sleep can increase the risk of injury, and 64 hours of bad sleep reduces strength, power and balance.<br><br>Now, many teams and players are making an effort to improve their sleep patterns. Manchester City player Sergio Agüero had difficulty sleeping because his muscular body prevented him from closing his legs when lying on his side. He got a new mattress that matched his height and weight, keeping his neck and back aligned at night. Meanwhile, James Milner found it hard to sleep after evening games, so he would play video games until the early hours. As a result, he was too tired to train the next morning. Setting a routine with a late bedtime, early rise, and an afternoon nap helped resolve this problem.<br><br>Whereas in the past, playing after a party and few hours of sleep was considered a badge of honour, now good sleep is considered an essential part of performance."
    }
  },
  {
    "id": 79,
    "q": "Summary lines 30-42:",
    "section": "4. Inglés (Sleep & Yamaguchi)",
    "visual": null,
    "opts": [
      "Trackers",
      "Routine",
      "Innovative cheap strategies"
    ],
    "ans": 2,
    "expl": "General idea.",
    "context": {
      "title": "TEXTO 5: How Sleep Transformed Professional Football",
      "content": "A few decades ago, professional footballers spent their nights partying. Now, they are much more aware of the benefits of a good night's sleep.<br><br>The change began in the mid-1990s, when mattress salesman Nick Littlehales contacted the manager of the Manchester United football team, Alex Ferguson, asking whether he had ever considered how sleep affected performance. Interested, Ferguson arranged for Littlehales to give a presentation to his team. Before long, the whole team had new mattresses and pillows, and Littlehales soon became football's leading mattress advisor.<br><br>Gradually, club managers began to pay more attention to scientific sleep research, and for good reason. In 2011, sleep specialist Cheri Mah discovered that increasing sleep to 8-10 hours per night massively increased the speed and shot accuracy of basketball players. Other research shows that a single night of inadequate sleep can increase the risk of injury, and 64 hours of bad sleep reduces strength, power and balance.<br><br>Now, many teams and players are making an effort to improve their sleep patterns. Manchester City player Sergio Agüero had difficulty sleeping because his muscular body prevented him from closing his legs when lying on his side. He got a new mattress that matched his height and weight, keeping his neck and back aligned at night. Meanwhile, James Milner found it hard to sleep after evening games, so he would play video games until the early hours. As a result, he was too tired to train the next morning. Setting a routine with a late bedtime, early rise, and an afternoon nap helped resolve this problem.<br><br>Whereas in the past, playing after a party and few hours of sleep was considered a badge of honour, now good sleep is considered an essential part of performance."
    }
  },
  {
    "id": 80,
    "q": "Underlined 'this problem':",
    "section": "4. Inglés (Sleep & Yamaguchi)",
    "visual": null,
    "opts": [
      "Routine",
      "Being tired to train",
      "Games"
    ],
    "ans": 1,
    "expl": "Refers to fatigue.",
    "context": {
      "title": "TEXTO 5: How Sleep Transformed Professional Football",
      "content": "A few decades ago, professional footballers spent their nights partying. Now, they are much more aware of the benefits of a good night's sleep.<br><br>The change began in the mid-1990s, when mattress salesman Nick Littlehales contacted the manager of the Manchester United football team, Alex Ferguson, asking whether he had ever considered how sleep affected performance. Interested, Ferguson arranged for Littlehales to give a presentation to his team. Before long, the whole team had new mattresses and pillows, and Littlehales soon became football's leading mattress advisor.<br><br>Gradually, club managers began to pay more attention to scientific sleep research, and for good reason. In 2011, sleep specialist Cheri Mah discovered that increasing sleep to 8-10 hours per night massively increased the speed and shot accuracy of basketball players. Other research shows that a single night of inadequate sleep can increase the risk of injury, and 64 hours of bad sleep reduces strength, power and balance.<br><br>Now, many teams and players are making an effort to improve their sleep patterns. Manchester City player Sergio Agüero had difficulty sleeping because his muscular body prevented him from closing his legs when lying on his side. He got a new mattress that matched his height and weight, keeping his neck and back aligned at night. Meanwhile, James Milner found it hard to sleep after evening games, so he would play video games until the early hours. As a result, he was too tired to train the next morning. Setting a routine with a late bedtime, early rise, and an afternoon nap helped resolve this problem.<br><br>Whereas in the past, playing after a party and few hours of sleep was considered a badge of honour, now good sleep is considered an essential part of performance."
    }
  },
  {
    "id": 81,
    "q": "Implication of research:",
    "section": "4. Inglés (Sleep & Yamaguchi)",
    "visual": null,
    "opts": [
      "Health",
      "Success only sleep",
      "Promotes strategies"
    ],
    "ans": 2,
    "expl": "Actionable implication.",
    "context": {
      "title": "TEXTO 5: How Sleep Transformed Professional Football",
      "content": "A few decades ago, professional footballers spent their nights partying. Now, they are much more aware of the benefits of a good night's sleep.<br><br>The change began in the mid-1990s, when mattress salesman Nick Littlehales contacted the manager of the Manchester United football team, Alex Ferguson, asking whether he had ever considered how sleep affected performance. Interested, Ferguson arranged for Littlehales to give a presentation to his team. Before long, the whole team had new mattresses and pillows, and Littlehales soon became football's leading mattress advisor.<br><br>Gradually, club managers began to pay more attention to scientific sleep research, and for good reason. In 2011, sleep specialist Cheri Mah discovered that increasing sleep to 8-10 hours per night massively increased the speed and shot accuracy of basketball players. Other research shows that a single night of inadequate sleep can increase the risk of injury, and 64 hours of bad sleep reduces strength, power and balance.<br><br>Now, many teams and players are making an effort to improve their sleep patterns. Manchester City player Sergio Agüero had difficulty sleeping because his muscular body prevented him from closing his legs when lying on his side. He got a new mattress that matched his height and weight, keeping his neck and back aligned at night. Meanwhile, James Milner found it hard to sleep after evening games, so he would play video games until the early hours. As a result, he was too tired to train the next morning. Setting a routine with a late bedtime, early rise, and an afternoon nap helped resolve this problem.<br><br>Whereas in the past, playing after a party and few hours of sleep was considered a badge of honour, now good sleep is considered an essential part of performance."
    }
  },
  {
    "id": 82,
    "q": "Author's position:",
    "section": "4. Inglés (Sleep & Yamaguchi)",
    "visual": null,
    "opts": [
      "Sleep is vital",
      "Free choice",
      "Always existed"
    ],
    "ans": 0,
    "expl": "Contrast past vs present.",
    "context": {
      "title": "TEXTO 5: How Sleep Transformed Professional Football",
      "content": "A few decades ago, professional footballers spent their nights partying. Now, they are much more aware of the benefits of a good night's sleep.<br><br>The change began in the mid-1990s, when mattress salesman Nick Littlehales contacted the manager of the Manchester United football team, Alex Ferguson, asking whether he had ever considered how sleep affected performance. Interested, Ferguson arranged for Littlehales to give a presentation to his team. Before long, the whole team had new mattresses and pillows, and Littlehales soon became football's leading mattress advisor.<br><br>Gradually, club managers began to pay more attention to scientific sleep research, and for good reason. In 2011, sleep specialist Cheri Mah discovered that increasing sleep to 8-10 hours per night massively increased the speed and shot accuracy of basketball players. Other research shows that a single night of inadequate sleep can increase the risk of injury, and 64 hours of bad sleep reduces strength, power and balance.<br><br>Now, many teams and players are making an effort to improve their sleep patterns. Manchester City player Sergio Agüero had difficulty sleeping because his muscular body prevented him from closing his legs when lying on his side. He got a new mattress that matched his height and weight, keeping his neck and back aligned at night. Meanwhile, James Milner found it hard to sleep after evening games, so he would play video games until the early hours. As a result, he was too tired to train the next morning. Setting a routine with a late bedtime, early rise, and an afternoon nap helped resolve this problem.<br><br>Whereas in the past, playing after a party and few hours of sleep was considered a badge of honour, now good sleep is considered an essential part of performance."
    }
  },
  {
    "id": 83,
    "q": "Word 'they' (line 21):",
    "section": "4. Inglés (Sleep & Yamaguchi)",
    "visual": null,
    "opts": [
      "Managers",
      "Southampton players",
      "City players"
    ],
    "ans": 1,
    "expl": "Refers to previous subject.",
    "context": {
      "title": "TEXTO 5: How Sleep Transformed Professional Football",
      "content": "A few decades ago, professional footballers spent their nights partying. Now, they are much more aware of the benefits of a good night's sleep.<br><br>The change began in the mid-1990s, when mattress salesman Nick Littlehales contacted the manager of the Manchester United football team, Alex Ferguson, asking whether he had ever considered how sleep affected performance. Interested, Ferguson arranged for Littlehales to give a presentation to his team. Before long, the whole team had new mattresses and pillows, and Littlehales soon became football's leading mattress advisor.<br><br>Gradually, club managers began to pay more attention to scientific sleep research, and for good reason. In 2011, sleep specialist Cheri Mah discovered that increasing sleep to 8-10 hours per night massively increased the speed and shot accuracy of basketball players. Other research shows that a single night of inadequate sleep can increase the risk of injury, and 64 hours of bad sleep reduces strength, power and balance.<br><br>Now, many teams and players are making an effort to improve their sleep patterns. Manchester City player Sergio Agüero had difficulty sleeping because his muscular body prevented him from closing his legs when lying on his side. He got a new mattress that matched his height and weight, keeping his neck and back aligned at night. Meanwhile, James Milner found it hard to sleep after evening games, so he would play video games until the early hours. As a result, he was too tired to train the next morning. Setting a routine with a late bedtime, early rise, and an afternoon nap helped resolve this problem.<br><br>Whereas in the past, playing after a party and few hours of sleep was considered a badge of honour, now good sleep is considered an essential part of performance."
    }
  },
  {
    "id": 84,
    "q": "Expression 'drew up':",
    "section": "4. Inglés (Sleep & Yamaguchi)",
    "visual": null,
    "opts": [
      "Elaborate",
      "Trace",
      "Illustrate"
    ],
    "ans": 0,
    "expl": "Create a plan.",
    "context": {
      "title": "TEXTO 5: How Sleep Transformed Professional Football",
      "content": "A few decades ago, professional footballers spent their nights partying. Now, they are much more aware of the benefits of a good night's sleep.<br><br>The change began in the mid-1990s, when mattress salesman Nick Littlehales contacted the manager of the Manchester United football team, Alex Ferguson, asking whether he had ever considered how sleep affected performance. Interested, Ferguson arranged for Littlehales to give a presentation to his team. Before long, the whole team had new mattresses and pillows, and Littlehales soon became football's leading mattress advisor.<br><br>Gradually, club managers began to pay more attention to scientific sleep research, and for good reason. In 2011, sleep specialist Cheri Mah discovered that increasing sleep to 8-10 hours per night massively increased the speed and shot accuracy of basketball players. Other research shows that a single night of inadequate sleep can increase the risk of injury, and 64 hours of bad sleep reduces strength, power and balance.<br><br>Now, many teams and players are making an effort to improve their sleep patterns. Manchester City player Sergio Agüero had difficulty sleeping because his muscular body prevented him from closing his legs when lying on his side. He got a new mattress that matched his height and weight, keeping his neck and back aligned at night. Meanwhile, James Milner found it hard to sleep after evening games, so he would play video games until the early hours. As a result, he was too tired to train the next morning. Setting a routine with a late bedtime, early rise, and an afternoon nap helped resolve this problem.<br><br>Whereas in the past, playing after a party and few hours of sleep was considered a badge of honour, now good sleep is considered an essential part of performance."
    }
  },
  {
    "id": 85,
    "q": "Word 'interventions':",
    "section": "4. Inglés (Sleep & Yamaguchi)",
    "visual": null,
    "opts": [
      "Strategies",
      "Operations",
      "Applications"
    ],
    "ans": 0,
    "expl": "Contextual meaning.",
    "context": {
      "title": "TEXTO 5: How Sleep Transformed Professional Football",
      "content": "A few decades ago, professional footballers spent their nights partying. Now, they are much more aware of the benefits of a good night's sleep.<br><br>The change began in the mid-1990s, when mattress salesman Nick Littlehales contacted the manager of the Manchester United football team, Alex Ferguson, asking whether he had ever considered how sleep affected performance. Interested, Ferguson arranged for Littlehales to give a presentation to his team. Before long, the whole team had new mattresses and pillows, and Littlehales soon became football's leading mattress advisor.<br><br>Gradually, club managers began to pay more attention to scientific sleep research, and for good reason. In 2011, sleep specialist Cheri Mah discovered that increasing sleep to 8-10 hours per night massively increased the speed and shot accuracy of basketball players. Other research shows that a single night of inadequate sleep can increase the risk of injury, and 64 hours of bad sleep reduces strength, power and balance.<br><br>Now, many teams and players are making an effort to improve their sleep patterns. Manchester City player Sergio Agüero had difficulty sleeping because his muscular body prevented him from closing his legs when lying on his side. He got a new mattress that matched his height and weight, keeping his neck and back aligned at night. Meanwhile, James Milner found it hard to sleep after evening games, so he would play video games until the early hours. As a result, he was too tired to train the next morning. Setting a routine with a late bedtime, early rise, and an afternoon nap helped resolve this problem.<br><br>Whereas in the past, playing after a party and few hours of sleep was considered a badge of honour, now good sleep is considered an essential part of performance."
    }
  },
  {
    "id": 86,
    "q": "Born ___ Nagasaki... killing ___ wife...",
    "section": "4. Inglés (Sleep & Yamaguchi)",
    "visual": null,
    "opts": [
      "in - his",
      "on - her",
      "at - he"
    ],
    "ans": 0,
    "expl": "Prepositions.",
    "context": {
      "title": "TEXTO 6: Tsutomu Yamaguchi (Double Survivor)",
      "content": "Tsutomu Yamaguchi was a Japanese engineer born on March 16, 1916. His life changed forever on August 6, 1945, when he was in Hiroshima on a business trip. That day, at 8:15 am, the first atomic bomb was dropped. Although Yamaguchi was three kilometers from the center of the explosion, he suffered serious burns, perforated eardrums, and bloodshot eyes. Many people died instantly, but he survived and spent the night in the destroyed city.<br><br>On August 7, Yamaguchi took a train to Nagasaki, his hometown, where his wife and children lived. He hoped the 300-kilometer journey would lead him to safety. But on August 9, 1945, when he was returning to work in Nagasaki, the second atomic bomb was dropped. Once again, Yamaguchi was about three kilometers from the center of the explosion. He again experienced the devastation, fire, and death around him. He fainted again, and when he woke up, he found himself in another razed city. He had survived BOTH atomic bombs.<br><br>Atomic bomb survivors are known as 'hibakusha', which means 'explosion-affected people'. Yamaguchi became a Nagasaki hibakusha immediately, but it wasn't until 2009 that the Japanese government officially recognized him as a Hiroshima hibakusha as well, becoming the only person officially recognized to have survived both attacks.<br><br>In his later years, Yamaguchi became an activist against nuclear weapons. He traveled to schools, universities, and was even received at the United Nations to tell his story. He died on January 4, 2010, at the age of 93, from stomach cancer."
    }
  },
  {
    "id": 87,
    "q": "Trip ___ city bombed... saw ___ flare.",
    "section": "4. Inglés (Sleep & Yamaguchi)",
    "visual": null,
    "opts": [
      "where - bigger",
      "when - biggest",
      "which - big"
    ],
    "ans": 1,
    "expl": "Time/Superlative.",
    "context": {
      "title": "TEXTO 6: Tsutomu Yamaguchi (Double Survivor)",
      "content": "Tsutomu Yamaguchi was a Japanese engineer born on March 16, 1916. His life changed forever on August 6, 1945, when he was in Hiroshima on a business trip. That day, at 8:15 am, the first atomic bomb was dropped. Although Yamaguchi was three kilometers from the center of the explosion, he suffered serious burns, perforated eardrums, and bloodshot eyes. Many people died instantly, but he survived and spent the night in the destroyed city.<br><br>On August 7, Yamaguchi took a train to Nagasaki, his hometown, where his wife and children lived. He hoped the 300-kilometer journey would lead him to safety. But on August 9, 1945, when he was returning to work in Nagasaki, the second atomic bomb was dropped. Once again, Yamaguchi was about three kilometers from the center of the explosion. He again experienced the devastation, fire, and death around him. He fainted again, and when he woke up, he found himself in another razed city. He had survived BOTH atomic bombs.<br><br>Atomic bomb survivors are known as 'hibakusha', which means 'explosion-affected people'. Yamaguchi became a Nagasaki hibakusha immediately, but it wasn't until 2009 that the Japanese government officially recognized him as a Hiroshima hibakusha as well, becoming the only person officially recognized to have survived both attacks.<br><br>In his later years, Yamaguchi became an activist against nuclear weapons. He traveled to schools, universities, and was even received at the United Nations to tell his story. He died on January 4, 2010, at the age of 93, from stomach cancer."
    }
  },
  {
    "id": 88,
    "q": "Dropped ___ hole... protective ___.",
    "section": "4. Inglés (Sleep & Yamaguchi)",
    "visual": null,
    "opts": [
      "into - measures",
      "on - policies",
      "under - rules"
    ],
    "ans": 0,
    "expl": "Into / Measures.",
    "context": {
      "title": "TEXTO 6: Tsutomu Yamaguchi (Double Survivor)",
      "content": "Tsutomu Yamaguchi was a Japanese engineer born on March 16, 1916. His life changed forever on August 6, 1945, when he was in Hiroshima on a business trip. That day, at 8:15 am, the first atomic bomb was dropped. Although Yamaguchi was three kilometers from the center of the explosion, he suffered serious burns, perforated eardrums, and bloodshot eyes. Many people died instantly, but he survived and spent the night in the destroyed city.<br><br>On August 7, Yamaguchi took a train to Nagasaki, his hometown, where his wife and children lived. He hoped the 300-kilometer journey would lead him to safety. But on August 9, 1945, when he was returning to work in Nagasaki, the second atomic bomb was dropped. Once again, Yamaguchi was about three kilometers from the center of the explosion. He again experienced the devastation, fire, and death around him. He fainted again, and when he woke up, he found himself in another razed city. He had survived BOTH atomic bombs.<br><br>Atomic bomb survivors are known as 'hibakusha', which means 'explosion-affected people'. Yamaguchi became a Nagasaki hibakusha immediately, but it wasn't until 2009 that the Japanese government officially recognized him as a Hiroshima hibakusha as well, becoming the only person officially recognized to have survived both attacks.<br><br>In his later years, Yamaguchi became an activist against nuclear weapons. He traveled to schools, universities, and was even received at the United Nations to tell his story. He died on January 4, 2010, at the age of 93, from stomach cancer."
    }
  },
  {
    "id": 89,
    "q": "Yamaguchi ___ as translator... ___ school.",
    "section": "4. Inglés (Sleep & Yamaguchi)",
    "visual": null,
    "opts": [
      "works",
      "worked - went",
      "has worked"
    ],
    "ans": 1,
    "expl": "Past tense.",
    "context": {
      "title": "TEXTO 6: Tsutomu Yamaguchi (Double Survivor)",
      "content": "Tsutomu Yamaguchi was a Japanese engineer born on March 16, 1916. His life changed forever on August 6, 1945, when he was in Hiroshima on a business trip. That day, at 8:15 am, the first atomic bomb was dropped. Although Yamaguchi was three kilometers from the center of the explosion, he suffered serious burns, perforated eardrums, and bloodshot eyes. Many people died instantly, but he survived and spent the night in the destroyed city.<br><br>On August 7, Yamaguchi took a train to Nagasaki, his hometown, where his wife and children lived. He hoped the 300-kilometer journey would lead him to safety. But on August 9, 1945, when he was returning to work in Nagasaki, the second atomic bomb was dropped. Once again, Yamaguchi was about three kilometers from the center of the explosion. He again experienced the devastation, fire, and death around him. He fainted again, and when he woke up, he found himself in another razed city. He had survived BOTH atomic bombs.<br><br>Atomic bomb survivors are known as 'hibakusha', which means 'explosion-affected people'. Yamaguchi became a Nagasaki hibakusha immediately, but it wasn't until 2009 that the Japanese government officially recognized him as a Hiroshima hibakusha as well, becoming the only person officially recognized to have survived both attacks.<br><br>In his later years, Yamaguchi became an activist against nuclear weapons. He traveled to schools, universities, and was even received at the United Nations to tell his story. He died on January 4, 2010, at the age of 93, from stomach cancer."
    }
  },
  {
    "id": 90,
    "q": "Synonyms: fainted, dark, picture...",
    "section": "4. Inglés (Sleep & Yamaguchi)",
    "visual": null,
    "opts": [
      "collapsed - black - movie",
      "fell - flashy",
      "slept - ugly"
    ],
    "ans": 0,
    "expl": "Contextual synonyms.",
    "context": {
      "title": "TEXTO 6: Tsutomu Yamaguchi (Double Survivor)",
      "content": "Tsutomu Yamaguchi was a Japanese engineer born on March 16, 1916. His life changed forever on August 6, 1945, when he was in Hiroshima on a business trip. That day, at 8:15 am, the first atomic bomb was dropped. Although Yamaguchi was three kilometers from the center of the explosion, he suffered serious burns, perforated eardrums, and bloodshot eyes. Many people died instantly, but he survived and spent the night in the destroyed city.<br><br>On August 7, Yamaguchi took a train to Nagasaki, his hometown, where his wife and children lived. He hoped the 300-kilometer journey would lead him to safety. But on August 9, 1945, when he was returning to work in Nagasaki, the second atomic bomb was dropped. Once again, Yamaguchi was about three kilometers from the center of the explosion. He again experienced the devastation, fire, and death around him. He fainted again, and when he woke up, he found himself in another razed city. He had survived BOTH atomic bombs.<br><br>Atomic bomb survivors are known as 'hibakusha', which means 'explosion-affected people'. Yamaguchi became a Nagasaki hibakusha immediately, but it wasn't until 2009 that the Japanese government officially recognized him as a Hiroshima hibakusha as well, becoming the only person officially recognized to have survived both attacks.<br><br>In his later years, Yamaguchi became an activist against nuclear weapons. He traveled to schools, universities, and was even received at the United Nations to tell his story. He died on January 4, 2010, at the age of 93, from stomach cancer."
    }
  },
  {
    "id": 91,
    "q": "Function sentence 2 (Examples):",
    "section": "4. Inglés (Sleep & Yamaguchi)",
    "visual": null,
    "opts": [
      "Consequence",
      "Gives examples",
      "Explanation"
    ],
    "ans": 1,
    "expl": "Lists details.",
    "context": {
      "title": "TEXTO 6: Tsutomu Yamaguchi (Double Survivor)",
      "content": "Tsutomu Yamaguchi was a Japanese engineer born on March 16, 1916. His life changed forever on August 6, 1945, when he was in Hiroshima on a business trip. That day, at 8:15 am, the first atomic bomb was dropped. Although Yamaguchi was three kilometers from the center of the explosion, he suffered serious burns, perforated eardrums, and bloodshot eyes. Many people died instantly, but he survived and spent the night in the destroyed city.<br><br>On August 7, Yamaguchi took a train to Nagasaki, his hometown, where his wife and children lived. He hoped the 300-kilometer journey would lead him to safety. But on August 9, 1945, when he was returning to work in Nagasaki, the second atomic bomb was dropped. Once again, Yamaguchi was about three kilometers from the center of the explosion. He again experienced the devastation, fire, and death around him. He fainted again, and when he woke up, he found himself in another razed city. He had survived BOTH atomic bombs.<br><br>Atomic bomb survivors are known as 'hibakusha', which means 'explosion-affected people'. Yamaguchi became a Nagasaki hibakusha immediately, but it wasn't until 2009 that the Japanese government officially recognized him as a Hiroshima hibakusha as well, becoming the only person officially recognized to have survived both attacks.<br><br>In his later years, Yamaguchi became an activist against nuclear weapons. He traveled to schools, universities, and was even received at the United Nations to tell his story. He died on January 4, 2010, at the age of 93, from stomach cancer."
    }
  },
  {
    "id": 92,
    "q": "Function sentence 2 (Specific date):",
    "section": "4. Inglés (Sleep & Yamaguchi)",
    "visual": null,
    "opts": [
      "Specifies event",
      "Effect",
      "Reason"
    ],
    "ans": 0,
    "expl": "Clarifies date.",
    "context": {
      "title": "TEXTO 6: Tsutomu Yamaguchi (Double Survivor)",
      "content": "Tsutomu Yamaguchi was a Japanese engineer born on March 16, 1916. His life changed forever on August 6, 1945, when he was in Hiroshima on a business trip. That day, at 8:15 am, the first atomic bomb was dropped. Although Yamaguchi was three kilometers from the center of the explosion, he suffered serious burns, perforated eardrums, and bloodshot eyes. Many people died instantly, but he survived and spent the night in the destroyed city.<br><br>On August 7, Yamaguchi took a train to Nagasaki, his hometown, where his wife and children lived. He hoped the 300-kilometer journey would lead him to safety. But on August 9, 1945, when he was returning to work in Nagasaki, the second atomic bomb was dropped. Once again, Yamaguchi was about three kilometers from the center of the explosion. He again experienced the devastation, fire, and death around him. He fainted again, and when he woke up, he found himself in another razed city. He had survived BOTH atomic bombs.<br><br>Atomic bomb survivors are known as 'hibakusha', which means 'explosion-affected people'. Yamaguchi became a Nagasaki hibakusha immediately, but it wasn't until 2009 that the Japanese government officially recognized him as a Hiroshima hibakusha as well, becoming the only person officially recognized to have survived both attacks.<br><br>In his later years, Yamaguchi became an activist against nuclear weapons. He traveled to schools, universities, and was even received at the United Nations to tell his story. He died on January 4, 2010, at the age of 93, from stomach cancer."
    }
  },
  {
    "id": 93,
    "q": "Who was Yamaguchi?",
    "section": "4. Inglés (Sleep & Yamaguchi)",
    "visual": null,
    "opts": [
      "Survivor",
      "Enthusiast",
      "Veteran"
    ],
    "ans": 0,
    "expl": "Main description.",
    "context": {
      "title": "TEXTO 6: Tsutomu Yamaguchi (Double Survivor)",
      "content": "Tsutomu Yamaguchi was a Japanese engineer born on March 16, 1916. His life changed forever on August 6, 1945, when he was in Hiroshima on a business trip. That day, at 8:15 am, the first atomic bomb was dropped. Although Yamaguchi was three kilometers from the center of the explosion, he suffered serious burns, perforated eardrums, and bloodshot eyes. Many people died instantly, but he survived and spent the night in the destroyed city.<br><br>On August 7, Yamaguchi took a train to Nagasaki, his hometown, where his wife and children lived. He hoped the 300-kilometer journey would lead him to safety. But on August 9, 1945, when he was returning to work in Nagasaki, the second atomic bomb was dropped. Once again, Yamaguchi was about three kilometers from the center of the explosion. He again experienced the devastation, fire, and death around him. He fainted again, and when he woke up, he found himself in another razed city. He had survived BOTH atomic bombs.<br><br>Atomic bomb survivors are known as 'hibakusha', which means 'explosion-affected people'. Yamaguchi became a Nagasaki hibakusha immediately, but it wasn't until 2009 that the Japanese government officially recognized him as a Hiroshima hibakusha as well, becoming the only person officially recognized to have survived both attacks.<br><br>In his later years, Yamaguchi became an activist against nuclear weapons. He traveled to schools, universities, and was even received at the United Nations to tell his story. He died on January 4, 2010, at the age of 93, from stomach cancer."
    }
  },
  {
    "id": 94,
    "q": "Correct spelling:",
    "section": "4. Inglés (Sleep & Yamaguchi)",
    "visual": null,
    "opts": [
      "relativaly",
      "acut",
      "Correct (relatively/acute)"
    ],
    "ans": 2,
    "expl": "Spelling check.",
    "context": {
      "title": "TEXTO 6: Tsutomu Yamaguchi (Double Survivor)",
      "content": "Tsutomu Yamaguchi was a Japanese engineer born on March 16, 1916. His life changed forever on August 6, 1945, when he was in Hiroshima on a business trip. That day, at 8:15 am, the first atomic bomb was dropped. Although Yamaguchi was three kilometers from the center of the explosion, he suffered serious burns, perforated eardrums, and bloodshot eyes. Many people died instantly, but he survived and spent the night in the destroyed city.<br><br>On August 7, Yamaguchi took a train to Nagasaki, his hometown, where his wife and children lived. He hoped the 300-kilometer journey would lead him to safety. But on August 9, 1945, when he was returning to work in Nagasaki, the second atomic bomb was dropped. Once again, Yamaguchi was about three kilometers from the center of the explosion. He again experienced the devastation, fire, and death around him. He fainted again, and when he woke up, he found himself in another razed city. He had survived BOTH atomic bombs.<br><br>Atomic bomb survivors are known as 'hibakusha', which means 'explosion-affected people'. Yamaguchi became a Nagasaki hibakusha immediately, but it wasn't until 2009 that the Japanese government officially recognized him as a Hiroshima hibakusha as well, becoming the only person officially recognized to have survived both attacks.<br><br>In his later years, Yamaguchi became an activist against nuclear weapons. He traveled to schools, universities, and was even received at the United Nations to tell his story. He died on January 4, 2010, at the age of 93, from stomach cancer."
    }
  },
  {
    "id": 95,
    "q": "Capitalization:",
    "section": "4. Inglés (Sleep & Yamaguchi)",
    "visual": null,
    "opts": [
      "japanese",
      "The Japanese survivor...",
      "Survivor"
    ],
    "ans": 1,
    "expl": "Proper nouns.",
    "context": {
      "title": "TEXTO 6: Tsutomu Yamaguchi (Double Survivor)",
      "content": "Tsutomu Yamaguchi was a Japanese engineer born on March 16, 1916. His life changed forever on August 6, 1945, when he was in Hiroshima on a business trip. That day, at 8:15 am, the first atomic bomb was dropped. Although Yamaguchi was three kilometers from the center of the explosion, he suffered serious burns, perforated eardrums, and bloodshot eyes. Many people died instantly, but he survived and spent the night in the destroyed city.<br><br>On August 7, Yamaguchi took a train to Nagasaki, his hometown, where his wife and children lived. He hoped the 300-kilometer journey would lead him to safety. But on August 9, 1945, when he was returning to work in Nagasaki, the second atomic bomb was dropped. Once again, Yamaguchi was about three kilometers from the center of the explosion. He again experienced the devastation, fire, and death around him. He fainted again, and when he woke up, he found himself in another razed city. He had survived BOTH atomic bombs.<br><br>Atomic bomb survivors are known as 'hibakusha', which means 'explosion-affected people'. Yamaguchi became a Nagasaki hibakusha immediately, but it wasn't until 2009 that the Japanese government officially recognized him as a Hiroshima hibakusha as well, becoming the only person officially recognized to have survived both attacks.<br><br>In his later years, Yamaguchi became an activist against nuclear weapons. He traveled to schools, universities, and was even received at the United Nations to tell his story. He died on January 4, 2010, at the age of 93, from stomach cancer."
    }
  },
  {
    "id": 96,
    "q": "Capitalization Title:",
    "section": "4. Inglés (Sleep & Yamaguchi)",
    "visual": null,
    "opts": [
      "Christopher Nolan film Oppenheimer",
      "Origins...",
      "Other"
    ],
    "ans": 0,
    "expl": "Titles.",
    "context": {
      "title": "TEXTO 6: Tsutomu Yamaguchi (Double Survivor)",
      "content": "Tsutomu Yamaguchi was a Japanese engineer born on March 16, 1916. His life changed forever on August 6, 1945, when he was in Hiroshima on a business trip. That day, at 8:15 am, the first atomic bomb was dropped. Although Yamaguchi was three kilometers from the center of the explosion, he suffered serious burns, perforated eardrums, and bloodshot eyes. Many people died instantly, but he survived and spent the night in the destroyed city.<br><br>On August 7, Yamaguchi took a train to Nagasaki, his hometown, where his wife and children lived. He hoped the 300-kilometer journey would lead him to safety. But on August 9, 1945, when he was returning to work in Nagasaki, the second atomic bomb was dropped. Once again, Yamaguchi was about three kilometers from the center of the explosion. He again experienced the devastation, fire, and death around him. He fainted again, and when he woke up, he found himself in another razed city. He had survived BOTH atomic bombs.<br><br>Atomic bomb survivors are known as 'hibakusha', which means 'explosion-affected people'. Yamaguchi became a Nagasaki hibakusha immediately, but it wasn't until 2009 that the Japanese government officially recognized him as a Hiroshima hibakusha as well, becoming the only person officially recognized to have survived both attacks.<br><br>In his later years, Yamaguchi became an activist against nuclear weapons. He traveled to schools, universities, and was even received at the United Nations to tell his story. He died on January 4, 2010, at the age of 93, from stomach cancer."
    }
  },
  {
    "id": 97,
    "q": "Punctuation:",
    "section": "4. Inglés (Sleep & Yamaguchi)",
    "visual": null,
    "opts": [
      "Missing",
      "Missing",
      "Correct (commas/quotes)"
    ],
    "ans": 2,
    "expl": "Direct speech.",
    "context": {
      "title": "TEXTO 6: Tsutomu Yamaguchi (Double Survivor)",
      "content": "Tsutomu Yamaguchi was a Japanese engineer born on March 16, 1916. His life changed forever on August 6, 1945, when he was in Hiroshima on a business trip. That day, at 8:15 am, the first atomic bomb was dropped. Although Yamaguchi was three kilometers from the center of the explosion, he suffered serious burns, perforated eardrums, and bloodshot eyes. Many people died instantly, but he survived and spent the night in the destroyed city.<br><br>On August 7, Yamaguchi took a train to Nagasaki, his hometown, where his wife and children lived. He hoped the 300-kilometer journey would lead him to safety. But on August 9, 1945, when he was returning to work in Nagasaki, the second atomic bomb was dropped. Once again, Yamaguchi was about three kilometers from the center of the explosion. He again experienced the devastation, fire, and death around him. He fainted again, and when he woke up, he found himself in another razed city. He had survived BOTH atomic bombs.<br><br>Atomic bomb survivors are known as 'hibakusha', which means 'explosion-affected people'. Yamaguchi became a Nagasaki hibakusha immediately, but it wasn't until 2009 that the Japanese government officially recognized him as a Hiroshima hibakusha as well, becoming the only person officially recognized to have survived both attacks.<br><br>In his later years, Yamaguchi became an activist against nuclear weapons. He traveled to schools, universities, and was even received at the United Nations to tell his story. He died on January 4, 2010, at the age of 93, from stomach cancer."
    }
  },
  {
    "id": 98,
    "q": "Order events:",
    "section": "4. Inglés (Sleep & Yamaguchi)",
    "visual": null,
    "opts": [
      "1,3,2,4",
      "2,1,4,3",
      "2,4,1,3"
    ],
    "ans": 1,
    "expl": "Chronological order.",
    "context": {
      "title": "TEXTO 6: Tsutomu Yamaguchi (Double Survivor)",
      "content": "Tsutomu Yamaguchi was a Japanese engineer born on March 16, 1916. His life changed forever on August 6, 1945, when he was in Hiroshima on a business trip. That day, at 8:15 am, the first atomic bomb was dropped. Although Yamaguchi was three kilometers from the center of the explosion, he suffered serious burns, perforated eardrums, and bloodshot eyes. Many people died instantly, but he survived and spent the night in the destroyed city.<br><br>On August 7, Yamaguchi took a train to Nagasaki, his hometown, where his wife and children lived. He hoped the 300-kilometer journey would lead him to safety. But on August 9, 1945, when he was returning to work in Nagasaki, the second atomic bomb was dropped. Once again, Yamaguchi was about three kilometers from the center of the explosion. He again experienced the devastation, fire, and death around him. He fainted again, and when he woke up, he found himself in another razed city. He had survived BOTH atomic bombs.<br><br>Atomic bomb survivors are known as 'hibakusha', which means 'explosion-affected people'. Yamaguchi became a Nagasaki hibakusha immediately, but it wasn't until 2009 that the Japanese government officially recognized him as a Hiroshima hibakusha as well, becoming the only person officially recognized to have survived both attacks.<br><br>In his later years, Yamaguchi became an activist against nuclear weapons. He traveled to schools, universities, and was even received at the United Nations to tell his story. He died on January 4, 2010, at the age of 93, from stomach cancer."
    }
  },
  {
    "id": 99,
    "q": "Best Title:",
    "section": "4. Inglés (Sleep & Yamaguchi)",
    "visual": null,
    "opts": [
      "Story of Resilience",
      "Engineering",
      "Devastation"
    ],
    "ans": 0,
    "expl": "Main theme.",
    "context": {
      "title": "TEXTO 6: Tsutomu Yamaguchi (Double Survivor)",
      "content": "Tsutomu Yamaguchi was a Japanese engineer born on March 16, 1916. His life changed forever on August 6, 1945, when he was in Hiroshima on a business trip. That day, at 8:15 am, the first atomic bomb was dropped. Although Yamaguchi was three kilometers from the center of the explosion, he suffered serious burns, perforated eardrums, and bloodshot eyes. Many people died instantly, but he survived and spent the night in the destroyed city.<br><br>On August 7, Yamaguchi took a train to Nagasaki, his hometown, where his wife and children lived. He hoped the 300-kilometer journey would lead him to safety. But on August 9, 1945, when he was returning to work in Nagasaki, the second atomic bomb was dropped. Once again, Yamaguchi was about three kilometers from the center of the explosion. He again experienced the devastation, fire, and death around him. He fainted again, and when he woke up, he found himself in another razed city. He had survived BOTH atomic bombs.<br><br>Atomic bomb survivors are known as 'hibakusha', which means 'explosion-affected people'. Yamaguchi became a Nagasaki hibakusha immediately, but it wasn't until 2009 that the Japanese government officially recognized him as a Hiroshima hibakusha as well, becoming the only person officially recognized to have survived both attacks.<br><br>In his later years, Yamaguchi became an activist against nuclear weapons. He traveled to schools, universities, and was even received at the United Nations to tell his story. He died on January 4, 2010, at the age of 93, from stomach cancer."
    }
  },
  {
    "id": 100,
    "q": "Complete: 'were slightly ___'",
    "section": "4. Inglés (Sleep & Yamaguchi)",
    "visual": null,
    "opts": [
      "injure",
      "injured",
      "been injured"
    ],
    "ans": 1,
    "expl": "Adjective.",
    "context": {
      "title": "TEXTO 6: Tsutomu Yamaguchi (Double Survivor)",
      "content": "Tsutomu Yamaguchi was a Japanese engineer born on March 16, 1916. His life changed forever on August 6, 1945, when he was in Hiroshima on a business trip. That day, at 8:15 am, the first atomic bomb was dropped. Although Yamaguchi was three kilometers from the center of the explosion, he suffered serious burns, perforated eardrums, and bloodshot eyes. Many people died instantly, but he survived and spent the night in the destroyed city.<br><br>On August 7, Yamaguchi took a train to Nagasaki, his hometown, where his wife and children lived. He hoped the 300-kilometer journey would lead him to safety. But on August 9, 1945, when he was returning to work in Nagasaki, the second atomic bomb was dropped. Once again, Yamaguchi was about three kilometers from the center of the explosion. He again experienced the devastation, fire, and death around him. He fainted again, and when he woke up, he found himself in another razed city. He had survived BOTH atomic bombs.<br><br>Atomic bomb survivors are known as 'hibakusha', which means 'explosion-affected people'. Yamaguchi became a Nagasaki hibakusha immediately, but it wasn't until 2009 that the Japanese government officially recognized him as a Hiroshima hibakusha as well, becoming the only person officially recognized to have survived both attacks.<br><br>In his later years, Yamaguchi became an activist against nuclear weapons. He traveled to schools, universities, and was even received at the United Nations to tell his story. He died on January 4, 2010, at the age of 93, from stomach cancer."
    }
  },
  {
    "id": 101,
    "q": "Matemáticas: Si 3x - 5 = 10, ¿cuánto vale x?",
    "section": "5. Preguntas Extra de Refuerzo",
    "visual": null,
    "opts": [
      "3",
      "5",
      "15"
    ],
    "ans": 1,
    "expl": "3x = 15 -> x = 5.",
    "context": {
      "title": "TEXTO 6: Tsutomu Yamaguchi (Double Survivor)",
      "content": "Tsutomu Yamaguchi was a Japanese engineer born on March 16, 1916. His life changed forever on August 6, 1945, when he was in Hiroshima on a business trip. That day, at 8:15 am, the first atomic bomb was dropped. Although Yamaguchi was three kilometers from the center of the explosion, he suffered serious burns, perforated eardrums, and bloodshot eyes. Many people died instantly, but he survived and spent the night in the destroyed city.<br><br>On August 7, Yamaguchi took a train to Nagasaki, his hometown, where his wife and children lived. He hoped the 300-kilometer journey would lead him to safety. But on August 9, 1945, when he was returning to work in Nagasaki, the second atomic bomb was dropped. Once again, Yamaguchi was about three kilometers from the center of the explosion. He again experienced the devastation, fire, and death around him. He fainted again, and when he woke up, he found himself in another razed city. He had survived BOTH atomic bombs.<br><br>Atomic bomb survivors are known as 'hibakusha', which means 'explosion-affected people'. Yamaguchi became a Nagasaki hibakusha immediately, but it wasn't until 2009 that the Japanese government officially recognized him as a Hiroshima hibakusha as well, becoming the only person officially recognized to have survived both attacks.<br><br>In his later years, Yamaguchi became an activist against nuclear weapons. He traveled to schools, universities, and was even received at the United Nations to tell his story. He died on January 4, 2010, at the age of 93, from stomach cancer."
    }
  },
  {
    "id": 102,
    "q": "Gramática: Sinónimo de 'Efímero'",
    "section": "5. Preguntas Extra de Refuerzo",
    "visual": null,
    "opts": [
      "Duradero",
      "Pasajero",
      "Eterno"
    ],
    "ans": 1,
    "expl": "Breve duración.",
    "context": {
      "title": "TEXTO 6: Tsutomu Yamaguchi (Double Survivor)",
      "content": "Tsutomu Yamaguchi was a Japanese engineer born on March 16, 1916. His life changed forever on August 6, 1945, when he was in Hiroshima on a business trip. That day, at 8:15 am, the first atomic bomb was dropped. Although Yamaguchi was three kilometers from the center of the explosion, he suffered serious burns, perforated eardrums, and bloodshot eyes. Many people died instantly, but he survived and spent the night in the destroyed city.<br><br>On August 7, Yamaguchi took a train to Nagasaki, his hometown, where his wife and children lived. He hoped the 300-kilometer journey would lead him to safety. But on August 9, 1945, when he was returning to work in Nagasaki, the second atomic bomb was dropped. Once again, Yamaguchi was about three kilometers from the center of the explosion. He again experienced the devastation, fire, and death around him. He fainted again, and when he woke up, he found himself in another razed city. He had survived BOTH atomic bombs.<br><br>Atomic bomb survivors are known as 'hibakusha', which means 'explosion-affected people'. Yamaguchi became a Nagasaki hibakusha immediately, but it wasn't until 2009 that the Japanese government officially recognized him as a Hiroshima hibakusha as well, becoming the only person officially recognized to have survived both attacks.<br><br>In his later years, Yamaguchi became an activist against nuclear weapons. He traveled to schools, universities, and was even received at the United Nations to tell his story. He died on January 4, 2010, at the age of 93, from stomach cancer."
    }
  },
  {
    "id": 103,
    "q": "Inglés: Antónimo de 'Expensive'",
    "section": "5. Preguntas Extra de Refuerzo",
    "visual": null,
    "opts": [
      "Cheap",
      "Costly",
      "High"
    ],
    "ans": 0,
    "expl": "Barato.",
    "context": {
      "title": "TEXTO 6: Tsutomu Yamaguchi (Double Survivor)",
      "content": "Tsutomu Yamaguchi was a Japanese engineer born on March 16, 1916. His life changed forever on August 6, 1945, when he was in Hiroshima on a business trip. That day, at 8:15 am, the first atomic bomb was dropped. Although Yamaguchi was three kilometers from the center of the explosion, he suffered serious burns, perforated eardrums, and bloodshot eyes. Many people died instantly, but he survived and spent the night in the destroyed city.<br><br>On August 7, Yamaguchi took a train to Nagasaki, his hometown, where his wife and children lived. He hoped the 300-kilometer journey would lead him to safety. But on August 9, 1945, when he was returning to work in Nagasaki, the second atomic bomb was dropped. Once again, Yamaguchi was about three kilometers from the center of the explosion. He again experienced the devastation, fire, and death around him. He fainted again, and when he woke up, he found himself in another razed city. He had survived BOTH atomic bombs.<br><br>Atomic bomb survivors are known as 'hibakusha', which means 'explosion-affected people'. Yamaguchi became a Nagasaki hibakusha immediately, but it wasn't until 2009 that the Japanese government officially recognized him as a Hiroshima hibakusha as well, becoming the only person officially recognized to have survived both attacks.<br><br>In his later years, Yamaguchi became an activist against nuclear weapons. He traveled to schools, universities, and was even received at the United Nations to tell his story. He died on January 4, 2010, at the age of 93, from stomach cancer."
    }
  },
  {
    "id": 114,
    "q": "¿En qué año llegó Cristóbal Colón a América?",
    "section": "5. Refuerzo General (Historia)",
    "visual": null,
    "opts": [
        "1490",
        "1492",
        "1495",
        "1500"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: 1492",
    "context": null
},
  {
    "id": 115,
    "q": "¿Quién fue el primer presidente de los Estados Unidos?",
    "section": "5. Refuerzo General (Historia)",
    "visual": null,
    "opts": [
        "Thomas Jefferson",
        "Abraham Lincoln",
        "George Washington",
        "John Adams"
    ],
    "ans": 2,
    "expl": "Respuesta correcta: George Washington",
    "context": null
},
  {
    "id": 116,
    "q": "¿En qué año comenzó la Primera Guerra Mundial?",
    "section": "5. Refuerzo General (Historia)",
    "visual": null,
    "opts": [
        "1912",
        "1914",
        "1916",
        "1918"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: 1914",
    "context": null
},
  {
    "id": 117,
    "q": "¿Qué civilización construyó las pirámides de Giza?",
    "section": "5. Refuerzo General (Historia)",
    "visual": null,
    "opts": [
        "Griega",
        "Egipcia",
        "Romana",
        "Mesopotámica"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: Egipcia",
    "context": null
},
  {
    "id": 118,
    "q": "¿Quién pintó la Mona Lisa?",
    "section": "5. Refuerzo General (Historia)",
    "visual": null,
    "opts": [
        "Miguel Ángel",
        "Rafael",
        "Leonardo da Vinci",
        "Botticelli"
    ],
    "ans": 2,
    "expl": "Respuesta correcta: Leonardo da Vinci",
    "context": null
},
  {
    "id": 119,
    "q": "¿En qué año cayó el Muro de Berlín?",
    "section": "5. Refuerzo General (Historia)",
    "visual": null,
    "opts": [
        "1987",
        "1988",
        "1989",
        "1991"
    ],
    "ans": 2,
    "expl": "Respuesta correcta: 1989",
    "context": null
},
  {
    "id": 120,
    "q": "¿Qué imperio fue gobernado por Julio César?",
    "section": "5. Refuerzo General (Historia)",
    "visual": null,
    "opts": [
        "Griego",
        "Romano",
        "Otomano",
        "Persa"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: Romano",
    "context": null
},
  {
    "id": 121,
    "q": "¿Quién escribió el Manifiesto Comunista junto a Friedrich Engels?",
    "section": "5. Refuerzo General (Historia)",
    "visual": null,
    "opts": [
        "Karl Marx",
        "Vladimir Lenin",
        "Joseph Stalin",
        "León Trotski"
    ],
    "ans": 0,
    "expl": "Respuesta correcta: Karl Marx",
    "context": null
},
  {
    "id": 122,
    "q": "¿En qué año comenzó la independencia de México?",
    "section": "5. Refuerzo General (Historia)",
    "visual": null,
    "opts": [
        "1808",
        "1810",
        "1812",
        "1821"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: 1810",
    "context": null
},
  {
    "id": 123,
    "q": "¿Qué país fue el primero en llegar a la Luna?",
    "section": "5. Refuerzo General (Historia)",
    "visual": null,
    "opts": [
        "Unión Soviética",
        "China",
        "Estados Unidos",
        "Reino Unido"
    ],
    "ans": 2,
    "expl": "Respuesta correcta: Estados Unidos",
    "context": null
},
  {
    "id": 124,
    "q": "¿Quién fue el líder de la Revolución Cubana?",
    "section": "5. Refuerzo General (Historia)",
    "visual": null,
    "opts": [
        "Che Guevara",
        "Fidel Castro",
        "Raúl Castro",
        "Camilo Cienfuegos"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: Fidel Castro",
    "context": null
},
  {
    "id": 125,
    "q": "¿En qué siglo ocurrió la Revolución Francesa?",
    "section": "5. Refuerzo General (Historia)",
    "visual": null,
    "opts": [
        "Siglo XVII",
        "Siglo XVIII",
        "Siglo XIX",
        "Siglo XX"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: Siglo XVIII",
    "context": null
},
  {
    "id": 126,
    "q": "¿Cuál es el río más largo del mundo?",
    "section": "5. Refuerzo General (Geografía)",
    "visual": null,
    "opts": [
        "Nilo",
        "Amazonas",
        "Misisipi",
        "Yangtsé"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: Amazonas",
    "context": null
},
  {
    "id": 127,
    "q": "¿Cuál es el país más grande del mundo por superficie?",
    "section": "5. Refuerzo General (Geografía)",
    "visual": null,
    "opts": [
        "Canadá",
        "China",
        "Rusia",
        "Estados Unidos"
    ],
    "ans": 2,
    "expl": "Respuesta correcta: Rusia",
    "context": null
},
  {
    "id": 128,
    "q": "¿Cuál es la capital de Australia?",
    "section": "5. Refuerzo General (Geografía)",
    "visual": null,
    "opts": [
        "Canberra",
        "Sídney",
        "Melbourne",
        "Brisbane"
    ],
    "ans": 0,
    "expl": "Respuesta correcta: Canberra",
    "context": null
},
  {
    "id": 129,
    "q": "¿En qué continente se encuentra el desierto del Sahara?",
    "section": "5. Refuerzo General (Geografía)",
    "visual": null,
    "opts": [
        "Asia",
        "África",
        "Oceanía",
        "América"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: África",
    "context": null
},
  {
    "id": 130,
    "q": "¿Cuál es el océano más grande del mundo?",
    "section": "5. Refuerzo General (Geografía)",
    "visual": null,
    "opts": [
        "Atlántico",
        "Índico",
        "Pacífico",
        "Ártico"
    ],
    "ans": 2,
    "expl": "Respuesta correcta: Pacífico",
    "context": null
},
  {
    "id": 131,
    "q": "¿Qué país tiene forma de bota?",
    "section": "5. Refuerzo General (Geografía)",
    "visual": null,
    "opts": [
        "Grecia",
        "Italia",
        "España",
        "Portugal"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: Italia",
    "context": null
},
  {
    "id": 132,
    "q": "¿Cuál es la montaña más alta del mundo?",
    "section": "5. Refuerzo General (Geografía)",
    "visual": null,
    "opts": [
        "Everest",
        "K2",
        "Kilimanjaro",
        "Aconcagua"
    ],
    "ans": 0,
    "expl": "Respuesta correcta: Everest",
    "context": null
},
  {
    "id": 133,
    "q": "¿Cuál es el país más poblado del mundo (2023)?",
    "section": "5. Refuerzo General (Geografía)",
    "visual": null,
    "opts": [
        "China",
        "Estados Unidos",
        "India",
        "Indonesia"
    ],
    "ans": 2,
    "expl": "Respuesta correcta: India",
    "context": null
},
  {
    "id": 134,
    "q": "¿En qué país se encuentra la Torre Eiffel?",
    "section": "5. Refuerzo General (Geografía)",
    "visual": null,
    "opts": [
        "Italia",
        "Francia",
        "España",
        "Reino Unido"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: Francia",
    "context": null
},
  {
    "id": 135,
    "q": "¿Cuál es la capital de Japón?",
    "section": "5. Refuerzo General (Geografía)",
    "visual": null,
    "opts": [
        "Tokio",
        "Kioto",
        "Osaka",
        "Yokohama"
    ],
    "ans": 0,
    "expl": "Respuesta correcta: Tokio",
    "context": null
},
  {
    "id": 136,
    "q": "¿Qué estrecho separa Europa de África?",
    "section": "5. Refuerzo General (Geografía)",
    "visual": null,
    "opts": [
        "Bósforo",
        "Malaca",
        "Gibraltar",
        "Ormuz"
    ],
    "ans": 2,
    "expl": "Respuesta correcta: Gibraltar",
    "context": null
},
  {
    "id": 137,
    "q": "¿Cuál es el lago más alto y grande de agua dulce en Sudamérica?",
    "section": "5. Refuerzo General (Geografía)",
    "visual": null,
    "opts": [
        "Maracaibo",
        "Titicaca",
        "Poopó",
        "General Carrera"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: Titicaca",
    "context": null
},
  {
    "id": 138,
    "q": "¿Cuál es el símbolo químico del oro?",
    "section": "5. Refuerzo General (Ciencia)",
    "visual": null,
    "opts": [
        "Au",
        "Ag",
        "Or",
        "Go"
    ],
    "ans": 0,
    "expl": "Respuesta correcta: Au",
    "context": null
},
  {
    "id": 139,
    "q": "¿Qué planeta es conocido como el planeta rojo?",
    "section": "5. Refuerzo General (Ciencia)",
    "visual": null,
    "opts": [
        "Júpiter",
        "Venus",
        "Marte",
        "Saturno"
    ],
    "ans": 2,
    "expl": "Respuesta correcta: Marte",
    "context": null
},
  {
    "id": 140,
    "q": "¿Cuál es la unidad básica de la vida?",
    "section": "5. Refuerzo General (Ciencia)",
    "visual": null,
    "opts": [
        "Átomo",
        "Célula",
        "Molécula",
        "Tejido"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: Célula",
    "context": null
},
  {
    "id": 141,
    "q": "¿Qué gas es esencial para la respiración humana?",
    "section": "5. Refuerzo General (Ciencia)",
    "visual": null,
    "opts": [
        "Oxígeno",
        "Nitrógeno",
        "Dióxido de carbono",
        "Hidrógeno"
    ],
    "ans": 0,
    "expl": "Respuesta correcta: Oxígeno",
    "context": null
},
  {
    "id": 142,
    "q": "¿Quién propuso la teoría de la relatividad?",
    "section": "5. Refuerzo General (Ciencia)",
    "visual": null,
    "opts": [
        "Isaac Newton",
        "Galileo Galilei",
        "Nikola Tesla",
        "Albert Einstein"
    ],
    "ans": 3,
    "expl": "Respuesta correcta: Albert Einstein",
    "context": null
},
  {
    "id": 143,
    "q": "¿Cuál es el hueso más largo del cuerpo humano?",
    "section": "5. Refuerzo General (Ciencia)",
    "visual": null,
    "opts": [
        "Tibia",
        "Húmero",
        "Fémur",
        "Radio"
    ],
    "ans": 2,
    "expl": "Respuesta correcta: Fémur",
    "context": null
},
  {
    "id": 144,
    "q": "¿Qué parte de la planta realiza principalmente la fotosíntesis?",
    "section": "5. Refuerzo General (Ciencia)",
    "visual": null,
    "opts": [
        "Raíz",
        "Hoja",
        "Tallo",
        "Flor"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: Hoja",
    "context": null
},
  {
    "id": 145,
    "q": "¿Cuál es la velocidad de la luz en el vacío (aproximada)?",
    "section": "5. Refuerzo General (Ciencia)",
    "visual": null,
    "opts": [
        "300,000 km/s",
        "150,000 km/s",
        "500,000 km/s",
        "1,000,000 km/s"
    ],
    "ans": 0,
    "expl": "Respuesta correcta: 300,000 km/s",
    "context": null
},
  {
    "id": 146,
    "q": "¿Qué científico es famoso por la ley de la gravedad y la manzana?",
    "section": "5. Refuerzo General (Ciencia)",
    "visual": null,
    "opts": [
        "Galileo",
        "Einstein",
        "Isaac Newton",
        "Darwin"
    ],
    "ans": 2,
    "expl": "Respuesta correcta: Isaac Newton",
    "context": null
},
  {
    "id": 147,
    "q": "¿Cuál es el elemento más abundante en el universo?",
    "section": "5. Refuerzo General (Ciencia)",
    "visual": null,
    "opts": [
        "Oxígeno",
        "Hidrógeno",
        "Helio",
        "Carbono"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: Hidrógeno",
    "context": null
},
  {
    "id": 148,
    "q": "¿Qué órgano del cuerpo humano produce insulina?",
    "section": "5. Refuerzo General (Ciencia)",
    "visual": null,
    "opts": [
        "Hígado",
        "Riñón",
        "Estómago",
        "Páncreas"
    ],
    "ans": 3,
    "expl": "Respuesta correcta: Páncreas",
    "context": null
},
  {
    "id": 149,
    "q": "¿Cuántos cromosomas tiene un ser humano normal?",
    "section": "5. Refuerzo General (Ciencia)",
    "visual": null,
    "opts": [
        "23",
        "44",
        "46",
        "48"
    ],
    "ans": 2,
    "expl": "Respuesta correcta: 46",
    "context": null
},
  {
    "id": 150,
    "q": "¿Qué significa HTML?",
    "section": "5. Refuerzo General (Tecnología)",
    "visual": null,
    "opts": [
        "High Text Modern Language",
        "HyperText Markup Language",
        "Home Tool Markup Language",
        "Hyperlinks and Text Markup Language"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: HyperText Markup Language",
    "context": null
},
  {
    "id": 151,
    "q": "¿Quién es el cofundador de Microsoft?",
    "section": "5. Refuerzo General (Tecnología)",
    "visual": null,
    "opts": [
        "Bill Gates",
        "Steve Jobs",
        "Mark Zuckerberg",
        "Elon Musk"
    ],
    "ans": 0,
    "expl": "Respuesta correcta: Bill Gates",
    "context": null
},
  {
    "id": 152,
    "q": "¿En qué año se lanzó el primer iPhone?",
    "section": "5. Refuerzo General (Tecnología)",
    "visual": null,
    "opts": [
        "2005",
        "2006",
        "2007",
        "2008"
    ],
    "ans": 2,
    "expl": "Respuesta correcta: 2007",
    "context": null
},
  {
    "id": 153,
    "q": "¿Qué lenguaje de programación es muy usado en inteligencia artificial?",
    "section": "5. Refuerzo General (Tecnología)",
    "visual": null,
    "opts": [
        "Java",
        "Python",
        "C++",
        "Ruby"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: Python",
    "context": null
},
  {
    "id": 154,
    "q": "¿Qué empresa desarrolló el sistema operativo Android?",
    "section": "5. Refuerzo General (Tecnología)",
    "visual": null,
    "opts": [
        "Apple",
        "Microsoft",
        "Google",
        "Samsung"
    ],
    "ans": 2,
    "expl": "Respuesta correcta: Google",
    "context": null
},
  {
    "id": 155,
    "q": "¿Qué significa CPU?",
    "section": "5. Refuerzo General (Tecnología)",
    "visual": null,
    "opts": [
        "Central Program Unit",
        "Computer Personal Unit",
        "Central Processing Unit",
        "Control Process Unit"
    ],
    "ans": 2,
    "expl": "Respuesta correcta: Central Processing Unit",
    "context": null
},
  {
    "id": 156,
    "q": "¿Cuál es la red social fundada por Mark Zuckerberg?",
    "section": "5. Refuerzo General (Tecnología)",
    "visual": null,
    "opts": [
        "Twitter",
        "Instagram",
        "Facebook",
        "Snapchat"
    ],
    "ans": 2,
    "expl": "Respuesta correcta: Facebook",
    "context": null
},
  {
    "id": 157,
    "q": "¿Qué protocolo se usa principalmente para enviar correos electrónicos?",
    "section": "5. Refuerzo General (Tecnología)",
    "visual": null,
    "opts": [
        "HTTP",
        "FTP",
        "TCP",
        "SMTP"
    ],
    "ans": 3,
    "expl": "Respuesta correcta: SMTP",
    "context": null
},
  {
    "id": 158,
    "q": "¿Qué significa RAM en informática?",
    "section": "5. Refuerzo General (Tecnología)",
    "visual": null,
    "opts": [
        "Read Access Memory",
        "Random Access Memory",
        "Run Application Memory",
        "Real Active Memory"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: Random Access Memory",
    "context": null
},
  {
    "id": 159,
    "q": "¿Quién es considerado el padre de la computación moderna?",
    "section": "5. Refuerzo General (Tecnología)",
    "visual": null,
    "opts": [
        "Charles Babbage",
        "Alan Turing",
        "John von Neumann",
        "Ada Lovelace"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: Alan Turing",
    "context": null
},
  {
    "id": 160,
    "q": "¿Qué empresa creó originalmente el lenguaje Java?",
    "section": "5. Refuerzo General (Tecnología)",
    "visual": null,
    "opts": [
        "Microsoft",
        "Sun Microsystems",
        "Oracle",
        "IBM"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: Sun Microsystems",
    "context": null
},
  {
    "id": 161,
    "q": "¿Qué significa WWW?",
    "section": "5. Refuerzo General (Tecnología)",
    "visual": null,
    "opts": [
        "World Wide Web",
        "Web World Wide",
        "Wide World Web",
        "World Web Wide"
    ],
    "ans": 0,
    "expl": "Respuesta correcta: World Wide Web",
    "context": null
},
  {
    "id": 162,
    "q": "¿Cuánto es 15 × 15?",
    "section": "5. Refuerzo General (Matemáticas)",
    "visual": null,
    "opts": [
        "215",
        "220",
        "225",
        "230"
    ],
    "ans": 2,
    "expl": "Respuesta correcta: 225",
    "context": null
},
  {
    "id": 163,
    "q": "¿Cuál es el valor de Pi (π) aproximado a dos decimales?",
    "section": "5. Refuerzo General (Matemáticas)",
    "visual": null,
    "opts": [
        "3.12",
        "3.14",
        "3.16",
        "3.18"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: 3.14",
    "context": null
},
  {
    "id": 164,
    "q": "¿Cuántos lados tiene un hexágono?",
    "section": "5. Refuerzo General (Matemáticas)",
    "visual": null,
    "opts": [
        "5",
        "6",
        "7",
        "8"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: 6",
    "context": null
},
  {
    "id": 165,
    "q": "¿Cuál es la raíz cuadrada de 144?",
    "section": "5. Refuerzo General (Matemáticas)",
    "visual": null,
    "opts": [
        "10",
        "11",
        "13",
        "12"
    ],
    "ans": 3,
    "expl": "Respuesta correcta: 12",
    "context": null
},
  {
    "id": 166,
    "q": "¿Qué número sigue en la secuencia: 2, 4, 8, 16, ...?",
    "section": "5. Refuerzo General (Matemáticas)",
    "visual": null,
    "opts": [
        "24",
        "32",
        "30",
        "28"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: 32",
    "context": null
},
  {
    "id": 167,
    "q": "¿Cuántos grados tiene un ángulo recto?",
    "section": "5. Refuerzo General (Matemáticas)",
    "visual": null,
    "opts": [
        "45",
        "60",
        "90",
        "180"
    ],
    "ans": 2,
    "expl": "Respuesta correcta: 90",
    "context": null
},
  {
    "id": 168,
    "q": "¿Cuál es el número primo más pequeño?",
    "section": "5. Refuerzo General (Matemáticas)",
    "visual": null,
    "opts": [
        "0",
        "1",
        "2",
        "3"
    ],
    "ans": 2,
    "expl": "Respuesta correcta: 2",
    "context": null
},
  {
    "id": 169,
    "q": "¿Cuánto es 100 dividido entre 4?",
    "section": "5. Refuerzo General (Matemáticas)",
    "visual": null,
    "opts": [
        "20",
        "25",
        "30",
        "50"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: 25",
    "context": null
},
  {
    "id": 170,
    "q": "¿Qué figura geométrica tiene 3 lados?",
    "section": "5. Refuerzo General (Matemáticas)",
    "visual": null,
    "opts": [
        "Cuadrado",
        "Pentágono",
        "Triángulo",
        "Rombo"
    ],
    "ans": 2,
    "expl": "Respuesta correcta: Triángulo",
    "context": null
},
  {
    "id": 171,
    "q": "¿Cuál es el resultado de 7 al cuadrado?",
    "section": "5. Refuerzo General (Matemáticas)",
    "visual": null,
    "opts": [
        "14",
        "21",
        "42",
        "49"
    ],
    "ans": 3,
    "expl": "Respuesta correcta: 49",
    "context": null
},
  {
    "id": 172,
    "q": "¿Cuántos milímetros hay en un metro?",
    "section": "5. Refuerzo General (Matemáticas)",
    "visual": null,
    "opts": [
        "100",
        "500",
        "1000",
        "10000"
    ],
    "ans": 2,
    "expl": "Respuesta correcta: 1000",
    "context": null
},
  {
    "id": 173,
    "q": "¿Qué número romano representa el 50?",
    "section": "5. Refuerzo General (Matemáticas)",
    "visual": null,
    "opts": [
        "X",
        "L",
        "C",
        "D"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: L",
    "context": null
},
  {
    "id": 174,
    "q": "¿Quién escribió 'Don Quijote de la Mancha'?",
    "section": "5. Refuerzo General (Literatura)",
    "visual": null,
    "opts": [
        "Lope de Vega",
        "Francisco de Quevedo",
        "Miguel de Cervantes",
        "Calderón de la Barca"
    ],
    "ans": 2,
    "expl": "Respuesta correcta: Miguel de Cervantes",
    "context": null
},
  {
    "id": 175,
    "q": "¿Quién escribió 'Cien años de soledad'?",
    "section": "5. Refuerzo General (Literatura)",
    "visual": null,
    "opts": [
        "Gabriel García Márquez",
        "Mario Vargas Llosa",
        "Julio Cortázar",
        "Jorge Luis Borges"
    ],
    "ans": 0,
    "expl": "Respuesta correcta: Gabriel García Márquez",
    "context": null
},
  {
    "id": 176,
    "q": "¿Quién es el autor de 'Romeo y Julieta'?",
    "section": "5. Refuerzo General (Literatura)",
    "visual": null,
    "opts": [
        "Charles Dickens",
        "William Shakespeare",
        "Jane Austen",
        "Mark Twain"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: William Shakespeare",
    "context": null
},
  {
    "id": 177,
    "q": "¿Qué poeta chileno ganó el Premio Nobel de Literatura en 1971?",
    "section": "5. Refuerzo General (Literatura)",
    "visual": null,
    "opts": [
        "Gabriela Mistral",
        "Pablo Neruda",
        "Vicente Huidobro",
        "Nicanor Parra"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: Pablo Neruda",
    "context": null
},
  {
    "id": 178,
    "q": "¿Quién escribió 'La Odisea'?",
    "section": "5. Refuerzo General (Literatura)",
    "visual": null,
    "opts": [
        "Sófocles",
        "Homero",
        "Virgilio",
        "Platón"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: Homero",
    "context": null
},
  {
    "id": 179,
    "q": "¿Cuál es el primer libro de la serie de Harry Potter?",
    "section": "5. Refuerzo General (Literatura)",
    "visual": null,
    "opts": [
        "La cámara secreta",
        "El prisionero de Azkaban",
        "La piedra filosofal",
        "El cáliz de fuego"
    ],
    "ans": 2,
    "expl": "Respuesta correcta: La piedra filosofal",
    "context": null
},
  {
    "id": 180,
    "q": "¿Quién escribió 'El Principito'?",
    "section": "5. Refuerzo General (Literatura)",
    "visual": null,
    "opts": [
        "Victor Hugo",
        "Antoine de Saint-Exupéry",
        "Jules Verne",
        "Albert Camus"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: Antoine de Saint-Exupéry",
    "context": null
},
  {
    "id": 181,
    "q": "¿Qué escritor ruso escribió 'Crimen y castigo'?",
    "section": "5. Refuerzo General (Literatura)",
    "visual": null,
    "opts": [
        "León Tolstói",
        "Fiódor Dostoyevski",
        "Antón Chéjov",
        "Iván Turguénev"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: Fiódor Dostoyevski",
    "context": null
},
  {
    "id": 182,
    "q": "¿Quién escribió 'Rayuela'?",
    "section": "5. Refuerzo General (Literatura)",
    "visual": null,
    "opts": [
        "Julio Cortázar",
        "Gabriel García Márquez",
        "Pablo Neruda",
        "Octavio Paz"
    ],
    "ans": 0,
    "expl": "Respuesta correcta: Julio Cortázar",
    "context": null
},
  {
    "id": 183,
    "q": "¿Qué autora escribió 'Orgullo y prejuicio'?",
    "section": "5. Refuerzo General (Literatura)",
    "visual": null,
    "opts": [
        "Charlotte Brontë",
        "Emily Brontë",
        "Jane Austen",
        "Mary Shelley"
    ],
    "ans": 2,
    "expl": "Respuesta correcta: Jane Austen",
    "context": null
},
  {
    "id": 184,
    "q": "¿Quién escribió 'La Divina Comedia'?",
    "section": "5. Refuerzo General (Literatura)",
    "visual": null,
    "opts": [
        "Petrarca",
        "Dante Alighieri",
        "Boccaccio",
        "Maquiavelo"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: Dante Alighieri",
    "context": null
},
  {
    "id": 185,
    "q": "¿Qué escritor colombiano ganó el Nobel de Literatura en 1982?",
    "section": "5. Refuerzo General (Literatura)",
    "visual": null,
    "opts": [
        "Álvaro Mutis",
        "Gabriel García Márquez",
        "Rafael Pombo",
        "José Eustasio Rivera"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: Gabriel García Márquez",
    "context": null
},
  {
    "id": 186,
    "q": "¿Quién pintó 'La noche estrellada'?",
    "section": "5. Refuerzo General (Arte)",
    "visual": null,
    "opts": [
        "Claude Monet",
        "Vincent van Gogh",
        "Paul Cézanne",
        "Edgar Degas"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: Vincent van Gogh",
    "context": null
},
  {
    "id": 187,
    "q": "¿En qué país se originó el tango?",
    "section": "5. Refuerzo General (Arte)",
    "visual": null,
    "opts": [
        "Brasil",
        "Chile",
        "Argentina",
        "Uruguay"
    ],
    "ans": 2,
    "expl": "Respuesta correcta: Argentina",
    "context": null
},
  {
    "id": 188,
    "q": "¿Quién esculpió 'El David'?",
    "section": "5. Refuerzo General (Arte)",
    "visual": null,
    "opts": [
        "Leonardo da Vinci",
        "Miguel Ángel",
        "Rafael",
        "Donatello"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: Miguel Ángel",
    "context": null
},
  {
    "id": 189,
    "q": "¿Qué movimiento artístico representa a Salvador Dalí?",
    "section": "5. Refuerzo General (Arte)",
    "visual": null,
    "opts": [
        "Impresionismo",
        "Cubismo",
        "Expresionismo",
        "Surrealismo"
    ],
    "ans": 3,
    "expl": "Respuesta correcta: Surrealismo",
    "context": null
},
  {
    "id": 190,
    "q": "¿En qué país se encuentra el museo del Louvre?",
    "section": "5. Refuerzo General (Arte)",
    "visual": null,
    "opts": [
        "Italia",
        "España",
        "Francia",
        "Reino Unido"
    ],
    "ans": 2,
    "expl": "Respuesta correcta: Francia",
    "context": null
},
  {
    "id": 191,
    "q": "¿Quién pintó 'El Guernica'?",
    "section": "5. Refuerzo General (Arte)",
    "visual": null,
    "opts": [
        "Salvador Dalí",
        "Joan Miró",
        "Pablo Picasso",
        "Diego Rivera"
    ],
    "ans": 2,
    "expl": "Respuesta correcta: Pablo Picasso",
    "context": null
},
  {
    "id": 192,
    "q": "¿Qué instrumento musical tiene tradicionalmente 88 teclas?",
    "section": "5. Refuerzo General (Arte)",
    "visual": null,
    "opts": [
        "Órgano",
        "Piano",
        "Acordeón",
        "Clavicordio"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: Piano",
    "context": null
},
  {
    "id": 193,
    "q": "¿Cuál es la danza tradicional más famosa de España?",
    "section": "5. Refuerzo General (Arte)",
    "visual": null,
    "opts": [
        "Salsa",
        "Tango",
        "Flamenco",
        "Jota"
    ],
    "ans": 2,
    "expl": "Respuesta correcta: Flamenco",
    "context": null
},
  {
    "id": 194,
    "q": "¿Quién compuso la 'Novena Sinfonía'?",
    "section": "5. Refuerzo General (Arte)",
    "visual": null,
    "opts": [
        "Mozart",
        "Ludwig van Beethoven",
        "Bach",
        "Chopin"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: Ludwig van Beethoven",
    "context": null
},
  {
    "id": 195,
    "q": "¿Qué artista es conocido por sus obras pop como las latas de sopa Campbell?",
    "section": "5. Refuerzo General (Arte)",
    "visual": null,
    "opts": [
        "Roy Lichtenstein",
        "Andy Warhol",
        "Keith Haring",
        "Jean-Michel Basquiat"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: Andy Warhol",
    "context": null
},
  {
    "id": 196,
    "q": "¿En qué ciudad-estado se encuentra la Capilla Sixtina?",
    "section": "5. Refuerzo General (Arte)",
    "visual": null,
    "opts": [
        "Roma",
        "Florencia",
        "Ciudad del Vaticano",
        "Venecia"
    ],
    "ans": 2,
    "expl": "Respuesta correcta: Ciudad del Vaticano",
    "context": null
},
  {
    "id": 197,
    "q": "¿Qué estilo arquitectónico se caracteriza por arcos apuntados y vitrales?",
    "section": "5. Refuerzo General (Arte)",
    "visual": null,
    "opts": [
        "Románico",
        "Gótico",
        "Renacentista",
        "Barroco"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: Gótico",
    "context": null
},
  {
    "id": 198,
    "q": "¿Cuántos jugadores tiene un equipo de fútbol en el campo?",
    "section": "5. Refuerzo General (Deportes)",
    "visual": null,
    "opts": [
        "9",
        "10",
        "11",
        "12"
    ],
    "ans": 2,
    "expl": "Respuesta correcta: 11",
    "context": null
},
  {
    "id": 199,
    "q": "¿En qué deporte se usa una raqueta y un volante?",
    "section": "5. Refuerzo General (Deportes)",
    "visual": null,
    "opts": [
        "Tenis",
        "Bádminton",
        "Squash",
        "Pádel"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: Bádminton",
    "context": null
},
  {
    "id": 200,
    "q": "¿Qué país ganó la Copa Mundial de la FIFA en 2022?",
    "section": "5. Refuerzo General (Deportes)",
    "visual": null,
    "opts": [
        "Francia",
        "Brasil",
        "Croacia",
        "Argentina"
    ],
    "ans": 3,
    "expl": "Respuesta correcta: Argentina",
    "context": null
},
  {
    "id": 201,
    "q": "¿Cuántos anillos tiene el símbolo olímpico?",
    "section": "5. Refuerzo General (Deportes)",
    "visual": null,
    "opts": [
        "4",
        "5",
        "6",
        "7"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: 5",
    "context": null
},
  {
    "id": 202,
    "q": "¿En qué deporte destaca Michael Phelps?",
    "section": "5. Refuerzo General (Deportes)",
    "visual": null,
    "opts": [
        "Atletismo",
        "Gimnasia",
        "Natación",
        "Ciclismo"
    ],
    "ans": 2,
    "expl": "Respuesta correcta: Natación",
    "context": null
},
  {
    "id": 203,
    "q": "¿Cuánto dura un partido de fútbol profesional estándar?",
    "section": "5. Refuerzo General (Deportes)",
    "visual": null,
    "opts": [
        "60 minutos",
        "75 minutos",
        "90 minutos",
        "120 minutos"
    ],
    "ans": 2,
    "expl": "Respuesta correcta: 90 minutos",
    "context": null
},
  {
    "id": 204,
    "q": "¿En qué país se originó el judo?",
    "section": "5. Refuerzo General (Deportes)",
    "visual": null,
    "opts": [
        "China",
        "Corea",
        "Tailandia",
        "Japón"
    ],
    "ans": 3,
    "expl": "Respuesta correcta: Japón",
    "context": null
},
  {
    "id": 205,
    "q": "¿Quién es conocido como 'El Rey' del fútbol?",
    "section": "5. Refuerzo General (Deportes)",
    "visual": null,
    "opts": [
        "Diego Maradona",
        "Pelé",
        "Lionel Messi",
        "Cristiano Ronaldo"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: Pelé",
    "context": null
},
  {
    "id": 206,
    "q": "¿En qué deporte se utiliza el término 'hole in one'?",
    "section": "5. Refuerzo General (Deportes)",
    "visual": null,
    "opts": [
        "Béisbol",
        "Golf",
        "Cricket",
        "Bolos"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: Golf",
    "context": null
},
  {
    "id": 207,
    "q": "¿Cuántos puntos vale un touchdown en fútbol americano?",
    "section": "5. Refuerzo General (Deportes)",
    "visual": null,
    "opts": [
        "3",
        "6",
        "7",
        "2"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: 6",
    "context": null
},
  {
    "id": 208,
    "q": "¿Qué tenista español ha ganado más títulos en Roland Garros?",
    "section": "5. Refuerzo General (Deportes)",
    "visual": null,
    "opts": [
        "Carlos Alcaraz",
        "Rafael Nadal",
        "David Ferrer",
        "Juan Carlos Ferrero"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: Rafael Nadal",
    "context": null
},
  {
    "id": 209,
    "q": "¿En qué año se celebraron los primeros Juegos Olímpicos modernos?",
    "section": "5. Refuerzo General (Deportes)",
    "visual": null,
    "opts": [
        "1892",
        "1896",
        "1900",
        "1904"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: 1896",
    "context": null
},
  {
    "id": 210,
    "q": "¿Cuál es el animal terrestre más rápido?",
    "section": "5. Refuerzo General (Naturaleza)",
    "visual": null,
    "opts": [
        "León",
        "Guepardo",
        "Gacela",
        "Caballo"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: Guepardo",
    "context": null
},
  {
    "id": 211,
    "q": "¿Qué animal es conocido como el rey de la selva?",
    "section": "5. Refuerzo General (Naturaleza)",
    "visual": null,
    "opts": [
        "Tigre",
        "León",
        "Elefante",
        "Gorila"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: León",
    "context": null
},
  {
    "id": 212,
    "q": "¿Cuál es el mamífero más grande del mundo?",
    "section": "5. Refuerzo General (Naturaleza)",
    "visual": null,
    "opts": [
        "Elefante africano",
        "Jirafa",
        "Ballena azul",
        "Rinoceronte"
    ],
    "ans": 2,
    "expl": "Respuesta correcta: Ballena azul",
    "context": null
},
  {
    "id": 213,
    "q": "¿Cuántas patas tiene una araña?",
    "section": "5. Refuerzo General (Naturaleza)",
    "visual": null,
    "opts": [
        "6",
        "8",
        "10",
        "12"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: 8",
    "context": null
},
  {
    "id": 214,
    "q": "¿Qué ave es símbolo universal de la paz?",
    "section": "5. Refuerzo General (Naturaleza)",
    "visual": null,
    "opts": [
        "Águila",
        "Paloma",
        "Cisne",
        "Colibrí"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: Paloma",
    "context": null
},
  {
    "id": 215,
    "q": "¿Cuál es el reptil más grande del mundo?",
    "section": "5. Refuerzo General (Naturaleza)",
    "visual": null,
    "opts": [
        "Anaconda",
        "Cocodrilo de agua salada",
        "Komodo",
        "Caimán"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: Cocodrilo de agua salada",
    "context": null
},
  {
    "id": 216,
    "q": "¿Qué animal es famoso por su excelente memoria a largo plazo?",
    "section": "5. Refuerzo General (Naturaleza)",
    "visual": null,
    "opts": [
        "Delfín",
        "Perro",
        "Elefante",
        "Cuervo"
    ],
    "ans": 2,
    "expl": "Respuesta correcta: Elefante",
    "context": null
},
  {
    "id": 217,
    "q": "¿Cuál es el único mamífero capaz de volar activamente?",
    "section": "5. Refuerzo General (Naturaleza)",
    "visual": null,
    "opts": [
        "Ardilla voladora",
        "Murciélago",
        "Colugo",
        "Petauro"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: Murciélago",
    "context": null
},
  {
    "id": 218,
    "q": "¿Qué tipo de animal es una rana?",
    "section": "5. Refuerzo General (Naturaleza)",
    "visual": null,
    "opts": [
        "Reptil",
        "Anfibio",
        "Pez",
        "Insecto"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: Anfibio",
    "context": null
},
  {
    "id": 219,
    "q": "¿Cuál es el ave más grande del mundo que no puede volar?",
    "section": "5. Refuerzo General (Naturaleza)",
    "visual": null,
    "opts": [
        "Emú",
        "Kiwi",
        "Avestruz",
        "Casuario"
    ],
    "ans": 2,
    "expl": "Respuesta correcta: Avestruz",
    "context": null
},
  {
    "id": 220,
    "q": "¿Qué animal es famoso por cambiar de color?",
    "section": "5. Refuerzo General (Naturaleza)",
    "visual": null,
    "opts": [
        "Iguana",
        "Camaleón",
        "Gecko",
        "Salamandra"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: Camaleón",
    "context": null
},
  {
    "id": 221,
    "q": "¿Cuántos corazones tiene un pulpo?",
    "section": "5. Refuerzo General (Naturaleza)",
    "visual": null,
    "opts": [
        "1",
        "2",
        "3",
        "4"
    ],
    "ans": 2,
    "expl": "Respuesta correcta: 3",
    "context": null
},
  {
    "id": 222,
    "q": "¿Cuál es el idioma con más hablantes nativos en el mundo?",
    "section": "5. Refuerzo General (Cultura General)",
    "visual": null,
    "opts": [
        "Chino mandarín",
        "Inglés",
        "Español",
        "Hindi"
    ],
    "ans": 0,
    "expl": "Respuesta correcta: Chino mandarín",
    "context": null
},
  {
    "id": 223,
    "q": "¿Qué moneda se utiliza en Japón?",
    "section": "5. Refuerzo General (Cultura General)",
    "visual": null,
    "opts": [
        "Won",
        "Yuan",
        "Yen",
        "Ringgit"
    ],
    "ans": 2,
    "expl": "Respuesta correcta: Yen",
    "context": null
},
  {
    "id": 224,
    "q": "¿Cuál es el día más largo del año en el hemisferio norte?",
    "section": "5. Refuerzo General (Cultura General)",
    "visual": null,
    "opts": [
        "Equinoccio de primavera",
        "Solsticio de verano",
        "Equinoccio de otoño",
        "Solsticio de invierno"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: Solsticio de verano",
    "context": null
},
  {
    "id": 225,
    "q": "¿Qué ingrediente es fundamental en la elaboración del pan?",
    "section": "5. Refuerzo General (Cultura General)",
    "visual": null,
    "opts": [
        "Arroz",
        "Harina",
        "Maíz",
        "Avena"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: Harina",
    "context": null
},
  {
    "id": 226,
    "q": "¿Cuál es considerado el metal más caro del mundo?",
    "section": "5. Refuerzo General (Cultura General)",
    "visual": null,
    "opts": [
        "Oro",
        "Platino",
        "Rodio",
        "Paladio"
    ],
    "ans": 2,
    "expl": "Respuesta correcta: Rodio",
    "context": null
},
  {
    "id": 227,
    "q": "¿Qué festividad se celebra el 31 de octubre?",
    "section": "5. Refuerzo General (Cultura General)",
    "visual": null,
    "opts": [
        "Navidad",
        "Año Nuevo",
        "Halloween",
        "Acción de Gracias"
    ],
    "ans": 2,
    "expl": "Respuesta correcta: Halloween",
    "context": null
},
  {
    "id": 228,
    "q": "¿Cuál es la capital de Canadá?",
    "section": "5. Refuerzo General (Cultura General)",
    "visual": null,
    "opts": [
        "Toronto",
        "Vancouver",
        "Ottawa",
        "Montreal"
    ],
    "ans": 2,
    "expl": "Respuesta correcta: Ottawa",
    "context": null
},
  {
    "id": 229,
    "q": "¿Qué significa la sigla ONU?",
    "section": "5. Refuerzo General (Cultura General)",
    "visual": null,
    "opts": [
        "Orden Nacional Unida",
        "Organización de las Naciones Unidas",
        "Oficina de Naciones Unidas",
        "Organismo Natural Universal"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: Organización de las Naciones Unidas",
    "context": null
},
  {
    "id": 230,
    "q": "¿Qué color resulta de mezclar azul y amarillo?",
    "section": "5. Refuerzo General (Cultura General)",
    "visual": null,
    "opts": [
        "Naranja",
        "Verde",
        "Morado",
        "Marrón"
    ],
    "ans": 1,
    "expl": "Respuesta correcta: Verde",
    "context": null
},
  {
    "id": 231,
    "q": "¿Qué planeta del sistema solar es famoso por sus anillos visibles?",
    "section": "5. Refuerzo General (Cultura General)",
    "visual": null,
    "opts": [
        "Júpiter",
        "Urano",
        "Saturno",
        "Neptuno"
    ],
    "ans": 2,
    "expl": "Respuesta correcta: Saturno",
    "context": null
},
  {
    "id": 232,
    "q": "¿Cuántos días tiene un año bisiesto?",
    "section": "5. Refuerzo General (Cultura General)",
    "visual": null,
    "opts": [
        "364",
        "365",
        "366",
        "367"
    ],
    "ans": 2,
    "expl": "Respuesta correcta: 366",
    "context": null
},
  {
    "id": 233,
    "q": "¿Qué órgano del cuerpo humano consume más energía?",
    "section": "5. Refuerzo General (Cultura General)",
    "visual": null,
    "opts": [
        "Corazón",
        "Hígado",
        "Pulmones",
        "Cerebro"
    ],
    "ans": 3,
    "expl": "Respuesta correcta: Cerebro",
    "context": null
},
// =============================================
// LOTE 2: MATEMÁTICAS Y RAZONAMIENTO (+48)
// =============================================
{
    "id": 224,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "Si \\(f(x) = 2x^2 - 3x + 1\\), ¿cuál es el valor de \\(f(-2)\\)?",
    "visual": null,
    "opts": ["15", "11", "7"],
    "ans": 0,
    "expl": "f(-2) = 2(4) - 3(-2) + 1 = 8 + 6 + 1 = 15.",
    "context": null
},
{
    "id": 225,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "Un terreno rectangular tiene un perímetro de 60 m y su largo es el doble del ancho. ¿Cuáles son las dimensiones?",
    "visual": null,
    "opts": ["10 m × 20 m", "15 m × 15 m", "12 m × 18 m"],
    "ans": 0,
    "expl": "Sea a el ancho: 2(a + 2a) = 60 → 6a = 60 → a = 10, largo = 20.",
    "context": null
},
{
    "id": 226,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "¿Cuál es el resultado de \\(\\frac{3}{4} + \\frac{2}{3} - \\frac{1}{6}\\)?",
    "visual": null,
    "opts": ["\\(\\frac{5}{4}\\)", "\\(\\frac{15}{12}\\)", "\\(\\frac{7}{6}\\)"],
    "ans": 1,
    "expl": "MCM = 12. Entonces 9/12 + 8/12 - 2/12 = 15/12 = 5/4.",
    "context": null
},
{
    "id": 227,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "Un automóvil recorre 240 km en 3 horas. Si mantiene la misma velocidad, ¿cuántos kilómetros recorrerá en 5 horas?",
    "visual": null,
    "opts": ["350 km", "400 km", "420 km"],
    "ans": 1,
    "expl": "Velocidad = 240/3 = 80 km/h. En 5 h: 80 × 5 = 400 km.",
    "context": null
},
{
    "id": 228,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "¿Cuál es el discriminante de la ecuación \\(2x^2 + 5x - 3 = 0\\)?",
    "visual": null,
    "opts": ["49", "1", "25"],
    "ans": 0,
    "expl": "D = b² - 4ac = 25 - 4(2)(-3) = 25 + 24 = 49.",
    "context": null
},
{
    "id": 229,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "Si log₁₀(x) = 3, ¿cuánto vale x?",
    "visual": null,
    "opts": ["30", "1000", "300"],
    "ans": 1,
    "expl": "log₁₀(x) = 3 significa 10³ = x = 1000.",
    "context": null
},
{
    "id": 230,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "En una urna hay 5 bolas rojas, 3 azules y 2 verdes. ¿Cuál es la probabilidad de sacar una bola que NO sea roja?",
    "visual": null,
    "opts": ["1/2", "3/10", "2/5"],
    "ans": 0,
    "expl": "No rojas = 3 + 2 = 5. Total = 10. P = 5/10 = 1/2.",
    "context": null
},
{
    "id": 231,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "¿Cuál es el valor de \\(\\sqrt[3]{-27}\\)?",
    "visual": null,
    "opts": ["-3", "3", "-9"],
    "ans": 0,
    "expl": "(-3)³ = -27, por lo tanto la raíz cúbica de -27 es -3.",
    "context": null
},
{
    "id": 232,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "Si el 15% de un número es 45, ¿cuál es el número?",
    "visual": null,
    "opts": ["300", "270", "350"],
    "ans": 0,
    "expl": "0.15x = 45 → x = 45/0.15 = 300.",
    "context": null
},
{
    "id": 233,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "¿Cuánto mide el ángulo interior de un hexágono regular?",
    "visual": null,
    "opts": ["120°", "135°", "108°"],
    "ans": 0,
    "expl": "Ángulo interior = (n-2)×180/n = (6-2)×180/6 = 720/6 = 120°.",
    "context": null
},
{
    "id": 234,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "Factorice: \\(x^2 - 9\\)",
    "visual": null,
    "opts": ["(x+3)(x-3)", "(x+9)(x-1)", "(x-3)²"],
    "ans": 0,
    "expl": "Diferencia de cuadrados: a² - b² = (a+b)(a-b). x² - 9 = (x+3)(x-3).",
    "context": null
},
{
    "id": 235,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "Un cilindro tiene radio 5 cm y altura 10 cm. ¿Cuál es su volumen? (Usa π ≈ 3.14)",
    "visual": null,
    "opts": ["785 cm³", "628 cm³", "1570 cm³"],
    "ans": 0,
    "expl": "V = πr²h = 3.14 × 25 × 10 = 785 cm³.",
    "context": null
},
{
    "id": 236,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "Simplifique: \\(\\frac{x^2 - 4}{x + 2}\\)",
    "visual": null,
    "opts": ["x - 2", "x + 2", "x² - 2"],
    "ans": 0,
    "expl": "(x²-4) = (x+2)(x-2). Al dividir entre (x+2) queda (x-2).",
    "context": null
},
{
    "id": 237,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "La mediana de los datos {2, 5, 7, 8, 12, 15, 20} es:",
    "visual": null,
    "opts": ["8", "7", "10"],
    "ans": 0,
    "expl": "7 datos, la mediana es el valor central (posición 4) = 8.",
    "context": null
},
{
    "id": 238,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "¿Cuál es la pendiente de la recta que pasa por los puntos (1, 3) y (4, 9)?",
    "visual": null,
    "opts": ["2", "3", "6"],
    "ans": 0,
    "expl": "m = (9-3)/(4-1) = 6/3 = 2.",
    "context": null
},
{
    "id": 239,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "Si \\(\\tan(\\theta) = 1\\), ¿cuánto vale \\(\\theta\\) en el primer cuadrante?",
    "visual": null,
    "opts": ["30°", "45°", "60°"],
    "ans": 1,
    "expl": "tan(45°) = sen(45°)/cos(45°) = 1.",
    "context": null
},
{
    "id": 240,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "¿Cuál es el MCD (Máximo Común Divisor) de 48 y 36?",
    "visual": null,
    "opts": ["6", "12", "18"],
    "ans": 1,
    "expl": "48 = 2⁴×3, 36 = 2²×3². MCD = 2²×3 = 12.",
    "context": null
},
{
    "id": 241,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "Un producto cuesta $850 y se le aplica un 20% de descuento y luego un IVA del 16%. ¿Cuál es el precio final?",
    "visual": null,
    "opts": ["$788.80", "$812.00", "$680.00"],
    "ans": 0,
    "expl": "Con descuento: 850 × 0.80 = 680. Con IVA: 680 × 1.16 = 788.80.",
    "context": null
},
{
    "id": 242,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "Resuelve: \\(|2x - 6| = 10\\)",
    "visual": null,
    "opts": ["x = 8 o x = -2", "x = 8 o x = 2", "x = -8 o x = 2"],
    "ans": 0,
    "expl": "2x - 6 = 10 → x = 8. 2x - 6 = -10 → x = -2.",
    "context": null
},
{
    "id": 243,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "¿Cuántas diagonales tiene un polígono de 8 lados?",
    "visual": null,
    "opts": ["16", "20", "24"],
    "ans": 1,
    "expl": "D = n(n-3)/2 = 8(5)/2 = 20.",
    "context": null
},
{
    "id": 244,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "Si \\(a^2 + b^2 = 25\\) y \\(a = 3\\), ¿cuál es el valor positivo de b?",
    "visual": null,
    "opts": ["4", "16", "\\(\\sqrt{16}\\)"],
    "ans": 0,
    "expl": "9 + b² = 25 → b² = 16 → b = 4.",
    "context": null
},
{
    "id": 245,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "La sucesión 3, 7, 11, 15, 19... es aritmética. ¿Cuál es el término 20?",
    "visual": null,
    "opts": ["79", "83", "75"],
    "ans": 0,
    "expl": "a₂₀ = a₁ + (n-1)d = 3 + 19(4) = 3 + 76 = 79.",
    "context": null
},
{
    "id": 246,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "¿Cuál es el área de un triángulo con base 12 cm y altura 8 cm?",
    "visual": null,
    "opts": ["48 cm²", "96 cm²", "36 cm²"],
    "ans": 0,
    "expl": "A = (b × h)/2 = (12 × 8)/2 = 48 cm².",
    "context": null
},
{
    "id": 247,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "Convierte 2.5 km a metros:",
    "visual": null,
    "opts": ["250 m", "2500 m", "25000 m"],
    "ans": 1,
    "expl": "1 km = 1000 m. 2.5 × 1000 = 2500 m.",
    "context": null
},
{
    "id": 248,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "Si \\(3^{x+1} = 81\\), ¿cuánto vale x?",
    "visual": null,
    "opts": ["2", "3", "4"],
    "ans": 1,
    "expl": "81 = 3⁴. Entonces 3^(x+1) = 3⁴ → x+1 = 4 → x = 3.",
    "context": null
},
{
    "id": 249,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "Se lanzan dos dados. ¿Cuál es la probabilidad de que la suma sea 7?",
    "visual": null,
    "opts": ["1/6", "1/12", "5/36"],
    "ans": 0,
    "expl": "Combinaciones para 7: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = 6/36 = 1/6.",
    "context": null
},
{
    "id": 250,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "¿Cuál es la ecuación de la recta con pendiente 3 que pasa por el punto (2, 5)?",
    "visual": null,
    "opts": ["y = 3x - 1", "y = 3x + 1", "y = 3x - 5"],
    "ans": 0,
    "expl": "y - 5 = 3(x - 2) → y = 3x - 6 + 5 → y = 3x - 1.",
    "context": null
},
{
    "id": 251,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "Simplifique: \\(\\frac{2^5 \\times 2^3}{2^4}\\)",
    "visual": null,
    "opts": ["2⁴ = 16", "2⁸ = 256", "2³ = 8"],
    "ans": 0,
    "expl": "2^(5+3-4) = 2⁴ = 16.",
    "context": null
},
{
    "id": 252,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "Un triángulo rectángulo tiene catetos de 6 cm y 8 cm. ¿Cuánto mide la hipotenusa?",
    "visual": null,
    "opts": ["10 cm", "14 cm", "12 cm"],
    "ans": 0,
    "expl": "c² = 6² + 8² = 36 + 64 = 100 → c = 10 cm.",
    "context": null
},
{
    "id": 253,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "¿Cuál es el rango de los datos: 4, 8, 15, 16, 23, 42?",
    "visual": null,
    "opts": ["38", "26", "42"],
    "ans": 0,
    "expl": "Rango = valor máximo - valor mínimo = 42 - 4 = 38.",
    "context": null
},
{
    "id": 254,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "Resuelve la desigualdad: \\(4x - 8 > 12\\)",
    "visual": null,
    "opts": ["x > 5", "x > 3", "x > 1"],
    "ans": 0,
    "expl": "4x > 20 → x > 5.",
    "context": null
},
{
    "id": 255,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "¿Cuál es el MCM (Mínimo Común Múltiplo) de 12 y 18?",
    "visual": null,
    "opts": ["36", "72", "24"],
    "ans": 0,
    "expl": "12 = 2²×3, 18 = 2×3². MCM = 2²×3² = 36.",
    "context": null
},
{
    "id": 256,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "Un reloj marca las 3:15. ¿Qué ángulo forman las manecillas?",
    "visual": null,
    "opts": ["7.5°", "0°", "15°"],
    "ans": 0,
    "expl": "A las 3:15, la manecilla de horas se ha movido 7.5° desde el 3. Minutero en el 3. Ángulo = 7.5°.",
    "context": null
},
{
    "id": 257,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "Si \\(\\frac{x}{3} = \\frac{12}{9}\\), ¿cuánto vale x?",
    "visual": null,
    "opts": ["4", "6", "3"],
    "ans": 0,
    "expl": "x/3 = 12/9 = 4/3 → x = 4.",
    "context": null
},
{
    "id": 258,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "El doble de un número más 7 es igual a 23. ¿Cuál es el número?",
    "visual": null,
    "opts": ["8", "15", "16"],
    "ans": 0,
    "expl": "2x + 7 = 23 → 2x = 16 → x = 8.",
    "context": null
},
{
    "id": 259,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "¿Cuál es el área de un círculo con diámetro 14 cm? (π ≈ 3.14)",
    "visual": null,
    "opts": ["153.86 cm²", "43.96 cm²", "615.44 cm²"],
    "ans": 0,
    "expl": "Radio = 7. A = πr² = 3.14 × 49 = 153.86 cm².",
    "context": null
},
{
    "id": 260,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "Tres amigos reparten una pizza en partes proporcionales a 2, 3 y 5. ¿Qué fracción le toca al que tiene la proporción de 3?",
    "visual": null,
    "opts": ["3/10", "1/3", "3/5"],
    "ans": 0,
    "expl": "Total partes = 2+3+5 = 10. Fracción = 3/10.",
    "context": null
},
{
    "id": 261,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "Si una inversión de $10,000 genera un interés simple del 8% anual, ¿cuánto dinero habrá después de 3 años?",
    "visual": null,
    "opts": ["$12,400", "$12,597.12", "$10,800"],
    "ans": 0,
    "expl": "I = C×r×t = 10000 × 0.08 × 3 = 2400. Total = 12,400.",
    "context": null
},
{
    "id": 262,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "¿Cuál es el vértice de la parábola \\(y = x^2 - 6x + 8\\)?",
    "visual": null,
    "opts": ["(3, -1)", "(6, 8)", "(-3, 1)"],
    "ans": 0,
    "expl": "x_v = -b/(2a) = 6/2 = 3. y_v = 9 - 18 + 8 = -1. Vértice: (3, -1).",
    "context": null
},
{
    "id": 263,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "Convierte 45°C a grados Fahrenheit:",
    "visual": null,
    "opts": ["113°F", "108°F", "95°F"],
    "ans": 0,
    "expl": "°F = (9/5)×45 + 32 = 81 + 32 = 113°F.",
    "context": null
},
{
    "id": 264,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "En una baraja de 52 cartas, ¿cuál es la probabilidad de sacar un rey o un as?",
    "visual": null,
    "opts": ["2/13", "1/13", "4/52"],
    "ans": 0,
    "expl": "Reyes = 4, Ases = 4. Total favorables = 8. P = 8/52 = 2/13.",
    "context": null
},
{
    "id": 265,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "¿Cuántos litros de agua caben en un tanque cúbico de 50 cm de arista?",
    "visual": null,
    "opts": ["125 litros", "250 litros", "62.5 litros"],
    "ans": 0,
    "expl": "V = 50³ = 125,000 cm³ = 125 litros (1L = 1000 cm³).",
    "context": null
},
{
    "id": 266,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "Si cos(60°) = 0.5, ¿cuánto vale sec(60°)?",
    "visual": null,
    "opts": ["2", "0.5", "1"],
    "ans": 0,
    "expl": "sec(θ) = 1/cos(θ) = 1/0.5 = 2.",
    "context": null
},
{
    "id": 267,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "La moda del conjunto de datos {4, 7, 2, 7, 3, 7, 9, 1} es:",
    "visual": null,
    "opts": ["7", "4", "5"],
    "ans": 0,
    "expl": "El 7 aparece 3 veces, más que cualquier otro valor.",
    "context": null
},
{
    "id": 268,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "Resuelve: \\(\\frac{2}{x} = \\frac{6}{9}\\)",
    "visual": null,
    "opts": ["3", "6", "2"],
    "ans": 0,
    "expl": "6x = 18 → x = 3.",
    "context": null
},
{
    "id": 269,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "¿Cuál es el resultado de \\((-3)^4\\)?",
    "visual": null,
    "opts": ["81", "-81", "12"],
    "ans": 0,
    "expl": "(-3)⁴ = (-3)×(-3)×(-3)×(-3) = 81 (exponente par, resultado positivo).",
    "context": null
},
{
    "id": 270,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "En un salón de 40 estudiantes, 60% son mujeres. ¿Cuántos hombres hay?",
    "visual": null,
    "opts": ["16", "24", "20"],
    "ans": 0,
    "expl": "Mujeres = 0.60 × 40 = 24. Hombres = 40 - 24 = 16.",
    "context": null
},
{
    "id": 271,
    "section": "1. Matemáticas y Razonamiento (Con Gráficos)",
    "q": "Si la hipotenusa de un triángulo rectángulo mide 13 y un cateto mide 5, ¿cuánto mide el otro cateto?",
    "visual": null,
    "opts": ["12", "8", "10"],
    "ans": 0,
    "expl": "c² = a² + b² → 169 = 25 + b² → b² = 144 → b = 12.",
    "context": null
},
// =============================================
// LOTE 3: LECTURA Y COMPRENSIÓN (+40, IDs 272-311)
// =============================================
{
    "id": 272,
    "section": "2. Lectura y Comprensión (Español)",
    "q": "Según el texto, ¿cuál es la principal ventaja del trabajo remoto mencionada?",
    "visual": null,
    "opts": ["Mayor productividad y flexibilidad horaria", "Menor costo de equipo", "Aumento del salario"],
    "ans": 0,
    "expl": "El texto destaca flexibilidad y productividad como beneficios principales.",
    "context": {
        "title": "TEXTO 5: El Trabajo Remoto en la Era Digital",
        "content": "El trabajo remoto ha transformado la manera en que millones de personas realizan sus actividades laborales. Desde 2020, esta modalidad dejó de ser una excepción para convertirse en norma en muchas industrias.<br><br>Entre sus principales ventajas se encuentran la mayor productividad reportada por los empleados y la flexibilidad horaria que permite conciliar la vida personal y profesional. Estudios de la Universidad de Stanford encontraron que los trabajadores remotos son un 13% más productivos que sus contrapartes presenciales.<br><br>Sin embargo, el trabajo remoto también presenta desafíos significativos. El aislamiento social, la dificultad para establecer límites entre trabajo y descanso, y la falta de supervisión directa pueden afectar negativamente la salud mental de los trabajadores.<br><br>Las empresas tecnológicas como Google y Microsoft han adoptado modelos híbridos, combinando días presenciales y remotos. Este enfoque busca aprovechar las ventajas de ambas modalidades mientras mitiga sus desventajas.<br><br>Los expertos coinciden en que el futuro del trabajo no será exclusivamente remoto ni presencial, sino una combinación inteligente de ambos que se adapte a las necesidades de cada organización y sus colaboradores."
    }
},
{
    "id": 273,
    "section": "2. Lectura y Comprensión (Español)",
    "q": "¿Qué desafío del trabajo remoto menciona el texto?",
    "visual": null,
    "opts": ["Aislamiento social y dificultad para establecer límites", "Falta de internet", "Bajo rendimiento tecnológico"],
    "ans": 0,
    "expl": "Párrafo 3: aislamiento social y dificultad para separar trabajo/descanso.",
    "context": {
        "title": "TEXTO 5: El Trabajo Remoto en la Era Digital",
        "content": "El trabajo remoto ha transformado la manera en que millones de personas realizan sus actividades laborales. Desde 2020, esta modalidad dejó de ser una excepción para convertirse en norma en muchas industrias.<br><br>Entre sus principales ventajas se encuentran la mayor productividad reportada por los empleados y la flexibilidad horaria que permite conciliar la vida personal y profesional. Estudios de la Universidad de Stanford encontraron que los trabajadores remotos son un 13% más productivos que sus contrapartes presenciales.<br><br>Sin embargo, el trabajo remoto también presenta desafíos significativos. El aislamiento social, la dificultad para establecer límites entre trabajo y descanso, y la falta de supervisión directa pueden afectar negativamente la salud mental de los trabajadores.<br><br>Las empresas tecnológicas como Google y Microsoft han adoptado modelos híbridos, combinando días presenciales y remotos. Este enfoque busca aprovechar las ventajas de ambas modalidades mientras mitiga sus desventajas.<br><br>Los expertos coinciden en que el futuro del trabajo no será exclusivamente remoto ni presencial, sino una combinación inteligente de ambos que se adapte a las necesidades de cada organización y sus colaboradores."
    }
},
{
    "id": 274,
    "section": "2. Lectura y Comprensión (Español)",
    "q": "¿Qué modelo han adoptado Google y Microsoft según el texto?",
    "visual": null,
    "opts": ["Totalmente remoto", "Modelo híbrido", "Presencial estricto"],
    "ans": 1,
    "expl": "Párrafo 4: 'modelos híbridos, combinando días presenciales y remotos'.",
    "context": {
        "title": "TEXTO 5: El Trabajo Remoto en la Era Digital",
        "content": "El trabajo remoto ha transformado la manera en que millones de personas realizan sus actividades laborales. Desde 2020, esta modalidad dejó de ser una excepción para convertirse en norma en muchas industrias.<br><br>Entre sus principales ventajas se encuentran la mayor productividad reportada por los empleados y la flexibilidad horaria que permite conciliar la vida personal y profesional. Estudios de la Universidad de Stanford encontraron que los trabajadores remotos son un 13% más productivos que sus contrapartes presenciales.<br><br>Sin embargo, el trabajo remoto también presenta desafíos significativos. El aislamiento social, la dificultad para establecer límites entre trabajo y descanso, y la falta de supervisión directa pueden afectar negativamente la salud mental de los trabajadores.<br><br>Las empresas tecnológicas como Google y Microsoft han adoptado modelos híbridos, combinando días presenciales y remotos. Este enfoque busca aprovechar las ventajas de ambas modalidades mientras mitiga sus desventajas.<br><br>Los expertos coinciden en que el futuro del trabajo no será exclusivamente remoto ni presencial, sino una combinación inteligente de ambos que se adapte a las necesidades de cada organización y sus colaboradores."
    }
},
{
    "id": 275,
    "section": "2. Lectura y Comprensión (Español)",
    "q": "¿Cuál es la postura de los expertos según el párrafo final?",
    "visual": null,
    "opts": ["El futuro es una combinación inteligente de ambos modelos", "El trabajo remoto desaparecerá", "Solo las tecnológicas se benefician"],
    "ans": 0,
    "expl": "'Una combinación inteligente de ambos que se adapte a las necesidades'.",
    "context": {
        "title": "TEXTO 5: El Trabajo Remoto en la Era Digital",
        "content": "El trabajo remoto ha transformado la manera en que millones de personas realizan sus actividades laborales. Desde 2020, esta modalidad dejó de ser una excepción para convertirse en norma en muchas industrias.<br><br>Entre sus principales ventajas se encuentran la mayor productividad reportada por los empleados y la flexibilidad horaria que permite conciliar la vida personal y profesional. Estudios de la Universidad de Stanford encontraron que los trabajadores remotos son un 13% más productivos que sus contrapartes presenciales.<br><br>Sin embargo, el trabajo remoto también presenta desafíos significativos. El aislamiento social, la dificultad para establecer límites entre trabajo y descanso, y la falta de supervisión directa pueden afectar negativamente la salud mental de los trabajadores.<br><br>Las empresas tecnológicas como Google y Microsoft han adoptado modelos híbridos, combinando días presenciales y remotos. Este enfoque busca aprovechar las ventajas de ambas modalidades mientras mitiga sus desventajas.<br><br>Los expertos coinciden en que el futuro del trabajo no será exclusivamente remoto ni presencial, sino una combinación inteligente de ambos que se adapte a las necesidades de cada organización y sus colaboradores."
    }
},
{
    "id": 276,
    "section": "2. Lectura y Comprensión (Español)",
    "q": "¿Qué dato estadístico proporciona el texto sobre productividad?",
    "visual": null,
    "opts": ["13% más productivos (Stanford)", "25% más rápidos", "50% menos errores"],
    "ans": 0,
    "expl": "Universidad de Stanford: trabajadores remotos 13% más productivos.",
    "context": {
        "title": "TEXTO 5: El Trabajo Remoto en la Era Digital",
        "content": "El trabajo remoto ha transformado la manera en que millones de personas realizan sus actividades laborales. Desde 2020, esta modalidad dejó de ser una excepción para convertirse en norma en muchas industrias.<br><br>Entre sus principales ventajas se encuentran la mayor productividad reportada por los empleados y la flexibilidad horaria que permite conciliar la vida personal y profesional. Estudios de la Universidad de Stanford encontraron que los trabajadores remotos son un 13% más productivos que sus contrapartes presenciales.<br><br>Sin embargo, el trabajo remoto también presenta desafíos significativos. El aislamiento social, la dificultad para establecer límites entre trabajo y descanso, y la falta de supervisión directa pueden afectar negativamente la salud mental de los trabajadores.<br><br>Las empresas tecnológicas como Google y Microsoft han adoptado modelos híbridos, combinando días presenciales y remotos. Este enfoque busca aprovechar las ventajas de ambas modalidades mientras mitiga sus desventajas.<br><br>Los expertos coinciden en que el futuro del trabajo no será exclusivamente remoto ni presencial, sino una combinación inteligente de ambos que se adapte a las necesidades de cada organización y sus colaboradores."
    }
},
{
    "id": 277,
    "section": "2. Lectura y Comprensión (Español)",
    "q": "¿Cuál es la idea principal del texto sobre la inteligencia artificial?",
    "visual": null,
    "opts": ["La IA es una herramienta poderosa pero requiere regulación ética", "La IA reemplazará todos los empleos", "La IA solo beneficia a las grandes empresas"],
    "ans": 0,
    "expl": "El texto equilibra beneficios con la necesidad de marcos éticos.",
    "context": {
        "title": "TEXTO 6: Inteligencia Artificial y Ética",
        "content": "La inteligencia artificial ha dejado de ser ciencia ficción para convertirse en una realidad cotidiana. Desde asistentes virtuales hasta diagnósticos médicos, la IA está presente en múltiples aspectos de la vida moderna.<br><br>Los avances en aprendizaje profundo han permitido crear sistemas capaces de reconocer patrones, traducir idiomas y generar contenido creativo. Estos desarrollos prometen revolucionar campos como la medicina, donde algoritmos pueden detectar enfermedades con mayor precisión que algunos especialistas humanos.<br><br>Sin embargo, el poder de la IA también genera preocupaciones legítimas. Los sesgos algorítmicos pueden perpetuar discriminaciones existentes. La automatización amenaza con eliminar millones de empleos. Y la capacidad de generar contenido falso, como los deepfakes, plantea riesgos para la democracia y la verdad.<br><br>Investigadores y legisladores coinciden en la necesidad urgente de establecer marcos éticos y regulatorios. La Unión Europea ha propuesto la Ley de IA, que clasifica los sistemas según su nivel de riesgo y establece requisitos proporcionados.<br><br>El desafío no es detener la IA, sino guiar su desarrollo para que beneficie a la humanidad sin comprometer valores fundamentales como la privacidad, la equidad y la autonomía individual."
    }
},
{
    "id": 278,
    "section": "2. Lectura y Comprensión (Español)",
    "q": "¿Qué riesgo de la IA menciona el texto relacionado con la democracia?",
    "visual": null,
    "opts": ["Los deepfakes", "El desempleo masivo", "La dependencia tecnológica"],
    "ans": 0,
    "expl": "'La capacidad de generar contenido falso, como los deepfakes, plantea riesgos para la democracia'.",
    "context": {
        "title": "TEXTO 6: Inteligencia Artificial y Ética",
        "content": "La inteligencia artificial ha dejado de ser ciencia ficción para convertirse en una realidad cotidiana. Desde asistentes virtuales hasta diagnósticos médicos, la IA está presente en múltiples aspectos de la vida moderna.<br><br>Los avances en aprendizaje profundo han permitido crear sistemas capaces de reconocer patrones, traducir idiomas y generar contenido creativo. Estos desarrollos prometen revolucionar campos como la medicina, donde algoritmos pueden detectar enfermedades con mayor precisión que algunos especialistas humanos.<br><br>Sin embargo, el poder de la IA también genera preocupaciones legítimas. Los sesgos algorítmicos pueden perpetuar discriminaciones existentes. La automatización amenaza con eliminar millones de empleos. Y la capacidad de generar contenido falso, como los deepfakes, plantea riesgos para la democracia y la verdad.<br><br>Investigadores y legisladores coinciden en la necesidad urgente de establecer marcos éticos y regulatorios. La Unión Europea ha propuesto la Ley de IA, que clasifica los sistemas según su nivel de riesgo y establece requisitos proporcionados.<br><br>El desafío no es detener la IA, sino guiar su desarrollo para que beneficie a la humanidad sin comprometer valores fundamentales como la privacidad, la equidad y la autonomía individual."
    }
},
{
    "id": 279,
    "section": "2. Lectura y Comprensión (Español)",
    "q": "Según el texto, ¿qué ha propuesto la Unión Europea?",
    "visual": null,
    "opts": ["La Ley de IA con clasificación por niveles de riesgo", "Prohibir la IA", "Un impuesto a las empresas de IA"],
    "ans": 0,
    "expl": "Párrafo 4: 'La Ley de IA, que clasifica los sistemas según su nivel de riesgo'.",
    "context": {
        "title": "TEXTO 6: Inteligencia Artificial y Ética",
        "content": "La inteligencia artificial ha dejado de ser ciencia ficción para convertirse en una realidad cotidiana. Desde asistentes virtuales hasta diagnósticos médicos, la IA está presente en múltiples aspectos de la vida moderna.<br><br>Los avances en aprendizaje profundo han permitido crear sistemas capaces de reconocer patrones, traducir idiomas y generar contenido creativo. Estos desarrollos prometen revolucionar campos como la medicina, donde algoritmos pueden detectar enfermedades con mayor precisión que algunos especialistas humanos.<br><br>Sin embargo, el poder de la IA también genera preocupaciones legítimas. Los sesgos algorítmicos pueden perpetuar discriminaciones existentes. La automatización amenaza con eliminar millones de empleos. Y la capacidad de generar contenido falso, como los deepfakes, plantea riesgos para la democracia y la verdad.<br><br>Investigadores y legisladores coinciden en la necesidad urgente de establecer marcos éticos y regulatorios. La Unión Europea ha propuesto la Ley de IA, que clasifica los sistemas según su nivel de riesgo y establece requisitos proporcionados.<br><br>El desafío no es detener la IA, sino guiar su desarrollo para que beneficie a la humanidad sin comprometer valores fundamentales como la privacidad, la equidad y la autonomía individual."
    }
},
{
    "id": 280,
    "section": "2. Lectura y Comprensión (Español)",
    "q": "¿Qué significa 'sesgos algorítmicos' en el contexto del texto?",
    "visual": null,
    "opts": ["Discriminaciones perpetuadas por sistemas de IA", "Errores de programación", "Fallas de hardware"],
    "ans": 0,
    "expl": "'Los sesgos algorítmicos pueden perpetuar discriminaciones existentes'.",
    "context": {
        "title": "TEXTO 6: Inteligencia Artificial y Ética",
        "content": "La inteligencia artificial ha dejado de ser ciencia ficción para convertirse en una realidad cotidiana. Desde asistentes virtuales hasta diagnósticos médicos, la IA está presente en múltiples aspectos de la vida moderna.<br><br>Los avances en aprendizaje profundo han permitido crear sistemas capaces de reconocer patrones, traducir idiomas y generar contenido creativo. Estos desarrollos prometen revolucionar campos como la medicina, donde algoritmos pueden detectar enfermedades con mayor precisión que algunos especialistas humanos.<br><br>Sin embargo, el poder de la IA también genera preocupaciones legítimas. Los sesgos algorítmicos pueden perpetuar discriminaciones existentes. La automatización amenaza con eliminar millones de empleos. Y la capacidad de generar contenido falso, como los deepfakes, plantea riesgos para la democracia y la verdad.<br><br>Investigadores y legisladores coinciden en la necesidad urgente de establecer marcos éticos y regulatorios. La Unión Europea ha propuesto la Ley de IA, que clasifica los sistemas según su nivel de riesgo y establece requisitos proporcionados.<br><br>El desafío no es detener la IA, sino guiar su desarrollo para que beneficie a la humanidad sin comprometer valores fundamentales como la privacidad, la equidad y la autonomía individual."
    }
},
{
    "id": 281,
    "section": "2. Lectura y Comprensión (Español)",
    "q": "¿Cuál es el tono del párrafo final?",
    "visual": null,
    "opts": ["Propositivo y equilibrado", "Alarmista", "Indiferente"],
    "ans": 0,
    "expl": "'Guiar su desarrollo para que beneficie a la humanidad' es un tono propositivo.",
    "context": {
        "title": "TEXTO 6: Inteligencia Artificial y Ética",
        "content": "La inteligencia artificial ha dejado de ser ciencia ficción para convertirse en una realidad cotidiana. Desde asistentes virtuales hasta diagnósticos médicos, la IA está presente en múltiples aspectos de la vida moderna.<br><br>Los avances en aprendizaje profundo han permitido crear sistemas capaces de reconocer patrones, traducir idiomas y generar contenido creativo. Estos desarrollos prometen revolucionar campos como la medicina, donde algoritmos pueden detectar enfermedades con mayor precisión que algunos especialistas humanos.<br><br>Sin embargo, el poder de la IA también genera preocupaciones legítimas. Los sesgos algorítmicos pueden perpetuar discriminaciones existentes. La automatización amenaza con eliminar millones de empleos. Y la capacidad de generar contenido falso, como los deepfakes, plantea riesgos para la democracia y la verdad.<br><br>Investigadores y legisladores coinciden en la necesidad urgente de establecer marcos éticos y regulatorios. La Unión Europea ha propuesto la Ley de IA, que clasifica los sistemas según su nivel de riesgo y establece requisitos proporcionados.<br><br>El desafío no es detener la IA, sino guiar su desarrollo para que beneficie a la humanidad sin comprometer valores fundamentales como la privacidad, la equidad y la autonomía individual."
    }
},
{
    "id": 282,
    "section": "2. Lectura y Comprensión (Español)",
    "q": "Según el texto, ¿por qué la migración es un fenómeno complejo?",
    "visual": null,
    "opts": ["Involucra factores económicos, políticos y sociales simultáneamente", "Solo afecta a países pobres", "Es un fenómeno reciente"],
    "ans": 0,
    "expl": "El texto presenta múltiples causas interrelacionadas.",
    "context": {
        "title": "TEXTO 7: Migración y Globalización",
        "content": "La migración humana es un fenómeno tan antiguo como la humanidad misma. Sin embargo, en las últimas décadas, los flujos migratorios han alcanzado una complejidad sin precedentes debido a la globalización.<br><br>Las causas de la migración son múltiples e interrelacionadas. Los factores económicos, como la búsqueda de mejores oportunidades laborales, se combinan con motivos políticos, como la huida de conflictos armados o regímenes autoritarios. A estos se suman factores ambientales, como sequías e inundaciones que hacen inhabitables ciertas regiones.<br><br>Los países receptores experimentan tanto beneficios como tensiones. Por un lado, los migrantes contribuyen a la economía, llenan vacantes laborales y enriquecen la diversidad cultural. Por otro, la integración genera desafíos en servicios públicos como salud, educación y vivienda.<br><br>Las remesas que envían los migrantes a sus países de origen constituyen una fuente vital de ingresos. En 2022, estas transferencias superaron los 600 mil millones de dólares, superando incluso la ayuda oficial al desarrollo.<br><br>La comunidad internacional reconoce la necesidad de gestionar la migración de manera ordenada, segura y regular, respetando los derechos humanos de todas las personas independientemente de su estatus migratorio."
    }
},
{
    "id": 283,
    "section": "2. Lectura y Comprensión (Español)",
    "q": "¿Qué dato económico menciona el texto sobre las remesas?",
    "visual": null,
    "opts": ["Superaron los 600 mil millones de dólares en 2022", "Representan el 50% del PIB", "Son insuficientes"],
    "ans": 0,
    "expl": "Párrafo 4: 'superaron los 600 mil millones de dólares'.",
    "context": {
        "title": "TEXTO 7: Migración y Globalización",
        "content": "La migración humana es un fenómeno tan antiguo como la humanidad misma. Sin embargo, en las últimas décadas, los flujos migratorios han alcanzado una complejidad sin precedentes debido a la globalización.<br><br>Las causas de la migración son múltiples e interrelacionadas. Los factores económicos, como la búsqueda de mejores oportunidades laborales, se combinan con motivos políticos, como la huida de conflictos armados o regímenes autoritarios. A estos se suman factores ambientales, como sequías e inundaciones que hacen inhabitables ciertas regiones.<br><br>Los países receptores experimentan tanto beneficios como tensiones. Por un lado, los migrantes contribuyen a la economía, llenan vacantes laborales y enriquecen la diversidad cultural. Por otro, la integración genera desafíos en servicios públicos como salud, educación y vivienda.<br><br>Las remesas que envían los migrantes a sus países de origen constituyen una fuente vital de ingresos. En 2022, estas transferencias superaron los 600 mil millones de dólares, superando incluso la ayuda oficial al desarrollo.<br><br>La comunidad internacional reconoce la necesidad de gestionar la migración de manera ordenada, segura y regular, respetando los derechos humanos de todas las personas independientemente de su estatus migratorio."
    }
},
{
    "id": 284,
    "section": "2. Lectura y Comprensión (Español)",
    "q": "¿Qué beneficio de la migración para los países receptores menciona el texto?",
    "visual": null,
    "opts": ["Contribución económica y diversidad cultural", "Menos impuestos", "Reducción de la población"],
    "ans": 0,
    "expl": "'Los migrantes contribuyen a la economía, llenan vacantes laborales y enriquecen la diversidad cultural'.",
    "context": {
        "title": "TEXTO 7: Migración y Globalización",
        "content": "La migración humana es un fenómeno tan antiguo como la humanidad misma. Sin embargo, en las últimas décadas, los flujos migratorios han alcanzado una complejidad sin precedentes debido a la globalización.<br><br>Las causas de la migración son múltiples e interrelacionadas. Los factores económicos, como la búsqueda de mejores oportunidades laborales, se combinan con motivos políticos, como la huida de conflictos armados o regímenes autoritarios. A estos se suman factores ambientales, como sequías e inundaciones que hacen inhabitables ciertas regiones.<br><br>Los países receptores experimentan tanto beneficios como tensiones. Por un lado, los migrantes contribuyen a la economía, llenan vacantes laborales y enriquecen la diversidad cultural. Por otro, la integración genera desafíos en servicios públicos como salud, educación y vivienda.<br><br>Las remesas que envían los migrantes a sus países de origen constituyen una fuente vital de ingresos. En 2022, estas transferencias superaron los 600 mil millones de dólares, superando incluso la ayuda oficial al desarrollo.<br><br>La comunidad internacional reconoce la necesidad de gestionar la migración de manera ordenada, segura y regular, respetando los derechos humanos de todas las personas independientemente de su estatus migratorio."
    }
},
{
    "id": 285,
    "section": "2. Lectura y Comprensión (Español)",
    "q": "¿Qué tipo de factores ambientales causan migración?",
    "visual": null,
    "opts": ["Sequías e inundaciones", "Terremotos solamente", "Contaminación del aire"],
    "ans": 0,
    "expl": "'Sequías e inundaciones que hacen inhabitables ciertas regiones'.",
    "context": {
        "title": "TEXTO 7: Migración y Globalización",
        "content": "La migración humana es un fenómeno tan antiguo como la humanidad misma. Sin embargo, en las últimas décadas, los flujos migratorios han alcanzado una complejidad sin precedentes debido a la globalización.<br><br>Las causas de la migración son múltiples e interrelacionadas. Los factores económicos, como la búsqueda de mejores oportunidades laborales, se combinan con motivos políticos, como la huida de conflictos armados o regímenes autoritarios. A estos se suman factores ambientales, como sequías e inundaciones que hacen inhabitables ciertas regiones.<br><br>Los países receptores experimentan tanto beneficios como tensiones. Por un lado, los migrantes contribuyen a la economía, llenan vacantes laborales y enriquecen la diversidad cultural. Por otro, la integración genera desafíos en servicios públicos como salud, educación y vivienda.<br><br>Las remesas que envían los migrantes a sus países de origen constituyen una fuente vital de ingresos. En 2022, estas transferencias superaron los 600 mil millones de dólares, superando incluso la ayuda oficial al desarrollo.<br><br>La comunidad internacional reconoce la necesidad de gestionar la migración de manera ordenada, segura y regular, respetando los derechos humanos de todas las personas independientemente de su estatus migratorio."
    }
},
{
    "id": 286,
    "section": "2. Lectura y Comprensión (Español)",
    "q": "¿Cuál es la postura de la comunidad internacional?",
    "visual": null,
    "opts": ["Gestionar la migración respetando los derechos humanos", "Cerrar todas las fronteras", "Ignorar el fenómeno"],
    "ans": 0,
    "expl": "'Gestionar la migración de manera ordenada, segura y regular, respetando los derechos humanos'.",
    "context": {
        "title": "TEXTO 7: Migración y Globalización",
        "content": "La migración humana es un fenómeno tan antiguo como la humanidad misma. Sin embargo, en las últimas décadas, los flujos migratorios han alcanzado una complejidad sin precedentes debido a la globalización.<br><br>Las causas de la migración son múltiples e interrelacionadas. Los factores económicos, como la búsqueda de mejores oportunidades laborales, se combinan con motivos políticos, como la huida de conflictos armados o regímenes autoritarios. A estos se suman factores ambientales, como sequías e inundaciones que hacen inhabitables ciertas regiones.<br><br>Los países receptores experimentan tanto beneficios como tensiones. Por un lado, los migrantes contribuyen a la economía, llenan vacantes laborales y enriquecen la diversidad cultural. Por otro, la integración genera desafíos en servicios públicos como salud, educación y vivienda.<br><br>Las remesas que envían los migrantes a sus países de origen constituyen una fuente vital de ingresos. En 2022, estas transferencias superaron los 600 mil millones de dólares, superando incluso la ayuda oficial al desarrollo.<br><br>La comunidad internacional reconoce la necesidad de gestionar la migración de manera ordenada, segura y regular, respetando los derechos humanos de todas las personas independientemente de su estatus migratorio."
    }
},
{
    "id": 287,
    "section": "2. Lectura y Comprensión (Español)",
    "q": "¿Cuál es el propósito principal del texto sobre el cambio climático?",
    "visual": null,
    "opts": ["Informar sobre las causas y consecuencias del calentamiento global", "Vender paneles solares", "Criticar a los gobiernos"],
    "ans": 0,
    "expl": "El texto es informativo-expositivo sobre el fenómeno del cambio climático.",
    "context": {
        "title": "TEXTO 8: Cambio Climático: Urgencia Global",
        "content": "El cambio climático representa la mayor amenaza ambiental que enfrenta la humanidad en el siglo XXI. Las temperaturas globales han aumentado aproximadamente 1.1°C desde la era preindustrial, y los científicos advierten que superar los 1.5°C podría desencadenar consecuencias irreversibles.<br><br>Las principales causas son las emisiones de gases de efecto invernadero, principalmente dióxido de carbono y metano, producidos por la quema de combustibles fósiles, la deforestación y la agricultura intensiva.<br><br>Los efectos ya son visibles: el nivel del mar está subiendo, los eventos climáticos extremos son más frecuentes e intensos, y los ecosistemas polares se están derritiendo a ritmos alarmantes. Los arrecifes de coral han perdido más del 50% de su cobertura desde 1950.<br><br>El Acuerdo de París de 2015 comprometió a 196 países a limitar el calentamiento. Sin embargo, los compromisos actuales son insuficientes. Se necesitan reducciones de emisiones del 45% para 2030 para mantener el objetivo de 1.5°C.<br><br>La transición hacia energías renovables, la electrificación del transporte y la reforestación masiva son algunas de las soluciones propuestas. El desafío requiere acción coordinada a nivel global, nacional e individual."
    }
},
{
    "id": 288,
    "section": "2. Lectura y Comprensión (Español)",
    "q": "Según el texto, ¿cuánto han aumentado las temperaturas globales?",
    "visual": null,
    "opts": ["Aproximadamente 1.1°C", "2°C", "0.5°C"],
    "ans": 0,
    "expl": "'Las temperaturas globales han aumentado aproximadamente 1.1°C desde la era preindustrial'.",
    "context": {
        "title": "TEXTO 8: Cambio Climático: Urgencia Global",
        "content": "El cambio climático representa la mayor amenaza ambiental que enfrenta la humanidad en el siglo XXI. Las temperaturas globales han aumentado aproximadamente 1.1°C desde la era preindustrial, y los científicos advierten que superar los 1.5°C podría desencadenar consecuencias irreversibles.<br><br>Las principales causas son las emisiones de gases de efecto invernadero, principalmente dióxido de carbono y metano, producidos por la quema de combustibles fósiles, la deforestación y la agricultura intensiva.<br><br>Los efectos ya son visibles: el nivel del mar está subiendo, los eventos climáticos extremos son más frecuentes e intensos, y los ecosistemas polares se están derritiendo a ritmos alarmantes. Los arrecifes de coral han perdido más del 50% de su cobertura desde 1950.<br><br>El Acuerdo de París de 2015 comprometió a 196 países a limitar el calentamiento. Sin embargo, los compromisos actuales son insuficientes. Se necesitan reducciones de emisiones del 45% para 2030 para mantener el objetivo de 1.5°C.<br><br>La transición hacia energías renovables, la electrificación del transporte y la reforestación masiva son algunas de las soluciones propuestas. El desafío requiere acción coordinada a nivel global, nacional e individual."
    }
},
{
    "id": 289,
    "section": "2. Lectura y Comprensión (Español)",
    "q": "¿Qué dato se menciona sobre los arrecifes de coral?",
    "visual": null,
    "opts": ["Han perdido más del 50% de su cobertura desde 1950", "Han desaparecido completamente", "Se han duplicado"],
    "ans": 0,
    "expl": "'Los arrecifes de coral han perdido más del 50% de su cobertura desde 1950'.",
    "context": {
        "title": "TEXTO 8: Cambio Climático: Urgencia Global",
        "content": "El cambio climático representa la mayor amenaza ambiental que enfrenta la humanidad en el siglo XXI. Las temperaturas globales han aumentado aproximadamente 1.1°C desde la era preindustrial, y los científicos advierten que superar los 1.5°C podría desencadenar consecuencias irreversibles.<br><br>Las principales causas son las emisiones de gases de efecto invernadero, principalmente dióxido de carbono y metano, producidos por la quema de combustibles fósiles, la deforestación y la agricultura intensiva.<br><br>Los efectos ya son visibles: el nivel del mar está subiendo, los eventos climáticos extremos son más frecuentes e intensos, y los ecosistemas polares se están derritiendo a ritmos alarmantes. Los arrecifes de coral han perdido más del 50% de su cobertura desde 1950.<br><br>El Acuerdo de París de 2015 comprometió a 196 países a limitar el calentamiento. Sin embargo, los compromisos actuales son insuficientes. Se necesitan reducciones de emisiones del 45% para 2030 para mantener el objetivo de 1.5°C.<br><br>La transición hacia energías renovables, la electrificación del transporte y la reforestación masiva son algunas de las soluciones propuestas. El desafío requiere acción coordinada a nivel global, nacional e individual."
    }
},
{
    "id": 290,
    "section": "2. Lectura y Comprensión (Español)",
    "q": "¿Qué porcentaje de reducción de emisiones se necesita para 2030?",
    "visual": null,
    "opts": ["45%", "30%", "60%"],
    "ans": 0,
    "expl": "'Se necesitan reducciones de emisiones del 45% para 2030'.",
    "context": {
        "title": "TEXTO 8: Cambio Climático: Urgencia Global",
        "content": "El cambio climático representa la mayor amenaza ambiental que enfrenta la humanidad en el siglo XXI. Las temperaturas globales han aumentado aproximadamente 1.1°C desde la era preindustrial, y los científicos advierten que superar los 1.5°C podría desencadenar consecuencias irreversibles.<br><br>Las principales causas son las emisiones de gases de efecto invernadero, principalmente dióxido de carbono y metano, producidos por la quema de combustibles fósiles, la deforestación y la agricultura intensiva.<br><br>Los efectos ya son visibles: el nivel del mar está subiendo, los eventos climáticos extremos son más frecuentes e intensos, y los ecosistemas polares se están derritiendo a ritmos alarmantes. Los arrecifes de coral han perdido más del 50% de su cobertura desde 1950.<br><br>El Acuerdo de París de 2015 comprometió a 196 países a limitar el calentamiento. Sin embargo, los compromisos actuales son insuficientes. Se necesitan reducciones de emisiones del 45% para 2030 para mantener el objetivo de 1.5°C.<br><br>La transición hacia energías renovables, la electrificación del transporte y la reforestación masiva son algunas de las soluciones propuestas. El desafío requiere acción coordinada a nivel global, nacional e individual."
    }
},
{
    "id": 291,
    "section": "2. Lectura y Comprensión (Español)",
    "q": "¿Qué soluciones propone el texto?",
    "visual": null,
    "opts": ["Energías renovables, transporte eléctrico y reforestación", "Solo energía solar", "Prohibir los autos"],
    "ans": 0,
    "expl": "'Energías renovables, la electrificación del transporte y la reforestación masiva'.",
    "context": {
        "title": "TEXTO 8: Cambio Climático: Urgencia Global",
        "content": "El cambio climático representa la mayor amenaza ambiental que enfrenta la humanidad en el siglo XXI. Las temperaturas globales han aumentado aproximadamente 1.1°C desde la era preindustrial, y los científicos advierten que superar los 1.5°C podría desencadenar consecuencias irreversibles.<br><br>Las principales causas son las emisiones de gases de efecto invernadero, principalmente dióxido de carbono y metano, producidos por la quema de combustibles fósiles, la deforestación y la agricultura intensiva.<br><br>Los efectos ya son visibles: el nivel del mar está subiendo, los eventos climáticos extremos son más frecuentes e intensos, y los ecosistemas polares se están derritiendo a ritmos alarmantes. Los arrecifes de coral han perdido más del 50% de su cobertura desde 1950.<br><br>El Acuerdo de París de 2015 comprometió a 196 países a limitar el calentamiento. Sin embargo, los compromisos actuales son insuficientes. Se necesitan reducciones de emisiones del 45% para 2030 para mantener el objetivo de 1.5°C.<br><br>La transición hacia energías renovables, la electrificación del transporte y la reforestación masiva son algunas de las soluciones propuestas. El desafío requiere acción coordinada a nivel global, nacional e individual."
    }
},
{
    "id": 292, "section": "2. Lectura y Comprensión (Español)", "q": "¿Cuál es el tipo de texto?", "visual": null, "opts": ["Expositivo-informativo", "Narrativo", "Argumentativo persuasivo"], "ans": 0, "expl": "Presenta información objetiva sobre causas, efectos y soluciones.", "context": null
},
{
    "id": 293, "section": "2. Lectura y Comprensión (Español)", "q": "¿Qué figura retórica se usa en 'el sol besaba las montañas'?", "visual": null, "opts": ["Personificación", "Hipérbole", "Metáfora"], "ans": 0, "expl": "Se atribuye una acción humana (besar) a un objeto inanimado (sol).", "context": null
},
{
    "id": 294, "section": "2. Lectura y Comprensión (Español)", "q": "¿Qué tipo de narrador usa la frase 'Yo caminé hacia la ventana y observé el jardín'?", "visual": null, "opts": ["Primera persona (protagonista)", "Tercera persona omnisciente", "Segunda persona"], "ans": 0, "expl": "El pronombre 'Yo' indica primera persona.", "context": null
},
{
    "id": 295, "section": "2. Lectura y Comprensión (Español)", "q": "En una carta formal, ¿cuál es el cierre adecuado?", "visual": null, "opts": ["Atentamente", "Un abrazo", "Nos vemos pronto"], "ans": 0, "expl": "'Atentamente' es el cierre formal estándar.", "context": null
},
{
    "id": 296, "section": "2. Lectura y Comprensión (Español)", "q": "¿Qué función tienen los conectores 'sin embargo', 'no obstante', 'aunque'?", "visual": null, "opts": ["Introducir una idea contraria (adversativos)", "Agregar información", "Indicar causa"], "ans": 0, "expl": "Son conectores adversativos que introducen contraste.", "context": null
},
{
    "id": 297, "section": "2. Lectura y Comprensión (Español)", "q": "¿Cuál es la diferencia entre un resumen y una paráfrasis?", "visual": null, "opts": ["El resumen sintetiza; la paráfrasis reformula con otras palabras", "Son lo mismo", "La paráfrasis es más corta"], "ans": 0, "expl": "Resumen = condensar. Paráfrasis = decir lo mismo con otras palabras.", "context": null
},
{
    "id": 298, "section": "2. Lectura y Comprensión (Español)", "q": "¿Qué es una tesis en un ensayo argumentativo?", "visual": null, "opts": ["La postura que el autor defiende", "El título del ensayo", "La conclusión"], "ans": 0, "expl": "La tesis es la afirmación central que se argumenta.", "context": null
},
{
    "id": 299, "section": "2. Lectura y Comprensión (Español)", "q": "El texto dice: 'La educación es la llave que abre todas las puertas.' Esto es:", "visual": null, "opts": ["Una metáfora", "Una comparación", "Una hipérbole"], "ans": 0, "expl": "Equipara educación = llave sin 'como', es metáfora.", "context": null
},
{
    "id": 300, "section": "2. Lectura y Comprensión (Español)", "q": "¿Cuál es la función de una nota al pie de página?", "visual": null, "opts": ["Proporcionar información adicional o citar fuentes", "Resumir el capítulo", "Decorar el documento"], "ans": 0, "expl": "Las notas al pie amplían información o referencian fuentes.", "context": null
},
{
    "id": 301, "section": "2. Lectura y Comprensión (Español)", "q": "¿Qué es un texto expositivo?", "visual": null, "opts": ["Un texto que informa y explica un tema de manera objetiva", "Un texto que narra una historia", "Un texto que intenta persuadir"], "ans": 0, "expl": "Expositivo = informar objetivamente.", "context": null
},
{
    "id": 302, "section": "2. Lectura y Comprensión (Español)", "q": "¿Qué recurso literario se emplea en 'tengo un millón de cosas que hacer'?", "visual": null, "opts": ["Hipérbole", "Metáfora", "Onomatopeya"], "ans": 0, "expl": "Exageración evidente = hipérbole.", "context": null
},
{
    "id": 303, "section": "2. Lectura y Comprensión (Español)", "q": "Identifica la idea principal: 'El agua es esencial para la vida. Cubre el 71% de la superficie terrestre, pero solo el 2.5% es agua dulce.'", "visual": null, "opts": ["El agua es esencial pero el agua dulce es escasa", "El agua cubre mucha superficie", "Hay mucha agua en el planeta"], "ans": 0, "expl": "La idea central combina importancia + escasez del agua dulce.", "context": null
},
{
    "id": 304, "section": "2. Lectura y Comprensión (Español)", "q": "¿Qué tipo de argumento es: 'Según la OMS, el 80% de las enfermedades se previenen con higiene'?", "visual": null, "opts": ["Argumento de autoridad", "Argumento por analogía", "Argumento emocional"], "ans": 0, "expl": "Cita a una institución reconocida (OMS) como respaldo.", "context": null
},
{
    "id": 305, "section": "2. Lectura y Comprensión (Español)", "q": "¿Cuál es la estructura básica de un texto narrativo?", "visual": null, "opts": ["Planteamiento, nudo y desenlace", "Tesis, argumento y conclusión", "Introducción, desarrollo y bibliografía"], "ans": 0, "expl": "La narrativa sigue: planteamiento → nudo → desenlace.", "context": null
},
{
    "id": 306, "section": "2. Lectura y Comprensión (Español)", "q": "¿Qué significa 'inferir' en el contexto de la lectura?", "visual": null, "opts": ["Deducir información que no está explícita en el texto", "Copiar el texto", "Memorizar las ideas"], "ans": 0, "expl": "Inferir = extraer conclusiones a partir de lo implícito.", "context": null
},
{
    "id": 307, "section": "2. Lectura y Comprensión (Español)", "q": "En el fragmento 'sus ojos eran dos luceros', ¿qué figura retórica se usa?", "visual": null, "opts": ["Metáfora", "Símil", "Hipérbole"], "ans": 0, "expl": "Equipara ojos = luceros directamente, sin 'como'. Metáfora.", "context": null
},
{
    "id": 308, "section": "2. Lectura y Comprensión (Español)", "q": "¿Qué es un mapa conceptual?", "visual": null, "opts": ["Una representación gráfica de ideas y sus relaciones jerárquicas", "Un resumen escrito", "Una lista de palabras clave"], "ans": 0, "expl": "Organiza conceptos en forma visual jerárquica.", "context": null
},
{
    "id": 309, "section": "2. Lectura y Comprensión (Español)", "q": "¿Cuál es la función del punto y coma (;)?", "visual": null, "opts": ["Separar oraciones relacionadas o elementos complejos en una enumeración", "Terminar un párrafo", "Introducir una cita"], "ans": 0, "expl": "El punto y coma separa unidades mayores que la coma.", "context": null
},
{
    "id": 310, "section": "2. Lectura y Comprensión (Español)", "q": "El género lírico se caracteriza por:", "visual": null, "opts": ["Expresar sentimientos y emociones del autor, generalmente en verso", "Narrar una historia con personajes", "Presentar diálogos para ser representados"], "ans": 0, "expl": "Lírica = expresión subjetiva de emociones.", "context": null
},
{
    "id": 311, "section": "2. Lectura y Comprensión (Español)", "q": "¿Qué diferencia a un hecho de una opinión?", "visual": null, "opts": ["El hecho es verificable; la opinión expresa un juicio personal", "Ambos son verificables", "La opinión siempre es correcta"], "ans": 0, "expl": "Hecho = comprobable. Opinión = subjetiva.", "context": null
},
// =============================================
// LOTE 4: LENGUA Y GRAMÁTICA (+32, IDs 312-343)
// =============================================
{
    "id": 312, "section": "3. Lengua y Gramática", "q": "¿Cuál de las siguientes oraciones tiene correcta concordancia?", "visual": null, "opts": ["El grupo de estudiantes aprobaron el examen", "El grupo de estudiantes aprobó el examen", "Los grupo de estudiantes aprobó el examen"], "ans": 1, "expl": "El sujeto es 'el grupo' (singular), verbo en singular.", "context": null
},
{
    "id": 313, "section": "3. Lengua y Gramática", "q": "¿Cuál es el sujeto en: 'Llegaron ayer los paquetes de Amazon'?", "visual": null, "opts": ["Los paquetes de Amazon", "Ayer", "Llegaron"], "ans": 0, "expl": "Pregunta: ¿Qué llegó? Los paquetes de Amazon.", "context": null
},
{
    "id": 314, "section": "3. Lengua y Gramática", "q": "Selecciona la oración con uso correcto de 'por qué', 'porque', 'porqué':", "visual": null, "opts": ["¿Por qué no viniste? Porque estaba enfermo.", "¿Porque no viniste? Por qué estaba enfermo.", "¿Porqué no viniste? Porque estaba enfermo."], "ans": 0, "expl": "'Por qué' (interrogativo), 'porque' (causal).", "context": null
},
{
    "id": 315, "section": "3. Lengua y Gramática", "q": "¿Qué tipo de oración es: 'Si estudias, aprobarás el examen'?", "visual": null, "opts": ["Condicional", "Imperativa", "Exclamativa"], "ans": 0, "expl": "Estructura si + condición → resultado = condicional.", "context": null
},
{
    "id": 316, "section": "3. Lengua y Gramática", "q": "Identifica el complemento directo en: 'María compró un libro nuevo':", "visual": null, "opts": ["Un libro nuevo", "María", "Compró"], "ans": 0, "expl": "¿Qué compró María? Un libro nuevo (CD).", "context": null
},
{
    "id": 317, "section": "3. Lengua y Gramática", "q": "¿Cuál es la forma correcta del pretérito de 'andar'?", "visual": null, "opts": ["Anduve", "Andé", "Andié"], "ans": 0, "expl": "'Andar' es irregular: yo anduve, tú anduviste...", "context": null
},
{
    "id": 318, "section": "3. Lengua y Gramática", "q": "¿Cuál palabra es esdrújula?", "visual": null, "opts": ["Matemáticas", "Reloj", "Canción"], "ans": 0, "expl": "Ma-te-MÁ-ti-cas. Acento en antepenúltima = esdrújula.", "context": null
},
{
    "id": 319, "section": "3. Lengua y Gramática", "q": "¿Qué signo se usa para indicar una cita textual?", "visual": null, "opts": ["Comillas", "Paréntesis", "Guion largo"], "ans": 0, "expl": "Las comillas encierran citas textuales.", "context": null
},
{
    "id": 320, "section": "3. Lengua y Gramática", "q": "En 'Tú tienes tu libro', ¿cuál 'tu/tú' lleva tilde y por qué?", "visual": null, "opts": ["'Tú' (pronombre personal) lleva tilde; 'tu' (posesivo) no", "'Tu' siempre lleva tilde", "Ninguno lleva tilde"], "ans": 0, "expl": "Tú = pronombre (tilde diacrítica). Tu = adjetivo posesivo.", "context": null
},
{
    "id": 321, "section": "3. Lengua y Gramática", "q": "¿Cuál es el plural correcto de 'hipótesis'?", "visual": null, "opts": ["Hipótesis (no cambia)", "Hipótesises", "Hipóteses"], "ans": 0, "expl": "Palabra esdrújula terminada en -s: el plural no cambia (las hipótesis).", "context": null
},
{
    "id": 322, "section": "3. Lengua y Gramática", "q": "¿Qué función cumple el adverbio en: 'Ella canta hermosamente'?", "visual": null, "opts": ["Modifica al verbo 'canta'", "Modifica al sujeto 'Ella'", "Es el predicado"], "ans": 0, "expl": "El adverbio 'hermosamente' modifica al verbo indicando cómo canta.", "context": null
},
{
    "id": 323, "section": "3. Lengua y Gramática", "q": "¿Cuál oración está en voz pasiva?", "visual": null, "opts": ["El informe fue redactado por el analista", "El analista redactó el informe", "Redactaron el informe rápidamente"], "ans": 0, "expl": "Estructura: sujeto paciente + ser + participio + complemento agente.", "context": null
},
{
    "id": 324, "section": "3. Lengua y Gramática", "q": "¿Cuál es el gerundio correcto del verbo 'ir'?", "visual": null, "opts": ["Yendo", "Iendo", "Indo"], "ans": 0, "expl": "Ir → yendo (forma irregular).", "context": null
},
{
    "id": 325, "section": "3. Lengua y Gramática", "q": "Elige la opción con ortografía correcta:", "visual": null, "opts": ["Excelente", "Exelente", "Ecselente"], "ans": 0, "expl": "Se escribe con X y C: ex-ce-len-te.", "context": null
},
{
    "id": 326, "section": "3. Lengua y Gramática", "q": "¿Qué tipo de oración es: '¡Qué hermoso día!'?", "visual": null, "opts": ["Exclamativa", "Interrogativa", "Imperativa"], "ans": 0, "expl": "Los signos de exclamación indican una oración exclamativa.", "context": null
},
{
    "id": 327, "section": "3. Lengua y Gramática", "q": "¿Cuándo se usa la 'b' en vez de la 'v'?", "visual": null, "opts": ["Después de 'm' (cambio, hombre)", "Después de 'n' (enviar)", "Siempre antes de consonante"], "ans": 0, "expl": "Regla: después de M siempre va B (mb).", "context": null
},
{
    "id": 328, "section": "3. Lengua y Gramática", "q": "Identifica la oración compuesta coordinada:", "visual": null, "opts": ["Estudié mucho, pero no aprobé", "Estudié mucho", "El que estudia, aprueba"], "ans": 0, "expl": "Dos oraciones unidas por 'pero' (nexo coordinante adversativo).", "context": null
},
{
    "id": 329, "section": "3. Lengua y Gramática", "q": "¿Qué es un neologismo?", "visual": null, "opts": ["Una palabra nueva que se incorpora al idioma", "Una palabra en desuso", "Un error gramatical"], "ans": 0, "expl": "Neo (nuevo) + logos (palabra) = palabra nueva.", "context": null
},
{
    "id": 330, "section": "3. Lengua y Gramática", "q": "¿Cuál es el antónimo de 'próspero'?", "visual": null, "opts": ["Adverso / decadente", "Exitoso", "Rico"], "ans": 0, "expl": "Próspero = exitoso, floreciente. Antónimo = adverso, decadente.", "context": null
},
{
    "id": 331, "section": "3. Lengua y Gramática", "q": "¿En cuál opción se usa correctamente el punto y coma?", "visual": null, "opts": ["Compré frutas; verduras; y carne", "Unos llegaron temprano; otros, tarde", "Fue al cine; porque quería."], "ans": 1, "expl": "Separa oraciones yuxtapuestas con elipsis: 'otros (llegaron) tarde'.", "context": null
},
{
    "id": 332, "section": "3. Lengua y Gramática", "q": "¿Qué es una oración subordinada?", "visual": null, "opts": ["Una oración que depende de otra principal", "Una oración sin verbo", "Una oración exclamativa"], "ans": 0, "expl": "Subordinada = depende sintácticamente de la principal.", "context": null
},
{
    "id": 333, "section": "3. Lengua y Gramática", "q": "Selecciona la opción con el uso correcto de 'haya', 'halla', 'allá':", "visual": null, "opts": ["Espero que haya llegado bien; el tesoro se halla allá", "Espero que halla llegado; el tesoro se haya allá", "Espero que allá llegado"], "ans": 0, "expl": "Haya (subjuntivo haber), halla (encontrar), allá (lugar).", "context": null
},
{
    "id": 334, "section": "3. Lengua y Gramática", "q": "¿Cuál de estas palabras es un sustantivo abstracto?", "visual": null, "opts": ["Felicidad", "Mesa", "Perro"], "ans": 0, "expl": "Felicidad no se puede percibir con los sentidos = abstracto.", "context": null
},
{
    "id": 335, "section": "3. Lengua y Gramática", "q": "¿Qué tiempo verbal se usa en 'habré terminado'?", "visual": null, "opts": ["Futuro perfecto (compuesto)", "Pretérito perfecto", "Condicional"], "ans": 0, "expl": "Habré (futuro de haber) + participio = futuro perfecto.", "context": null
},
{
    "id": 336, "section": "3. Lengua y Gramática", "q": "¿Cuál oración tiene un error de redundancia?", "visual": null, "opts": ["Subir arriba", "Bajar rápido", "Correr velozmente"], "ans": 0, "expl": "'Subir arriba' es redundante (subir ya implica ir arriba).", "context": null
},
{
    "id": 337, "section": "3. Lengua y Gramática", "q": "¿Qué es una oración impersonal?", "visual": null, "opts": ["Una oración sin sujeto gramatical", "Una oración sin verbo", "Una oración en primera persona"], "ans": 0, "expl": "Ej: 'Llueve mucho'. No hay sujeto. Son impersonales.", "context": null
},
{
    "id": 338, "section": "3. Lengua y Gramática", "q": "¿Cuál es el prefijo en la palabra 'deshacer'?", "visual": null, "opts": ["Des-", "De-", "Desh-"], "ans": 0, "expl": "Des- (negación/inversión) + hacer.", "context": null
},
{
    "id": 339, "section": "3. Lengua y Gramática", "q": "Selecciona la oración con dequeísmo incorrecto:", "visual": null, "opts": ["Pienso de que es importante", "Pienso que es importante", "Estoy seguro de que vendrá"], "ans": 0, "expl": "'Pienso de que' es dequeísmo. Lo correcto: 'Pienso que'.", "context": null
},
{
    "id": 340, "section": "3. Lengua y Gramática", "q": "¿Qué significa el sufijo '-logía'?", "visual": null, "opts": ["Estudio o ciencia de", "Miedo a", "Inflamación de"], "ans": 0, "expl": "-logía (del griego logos) = estudio. Biología, Psicología, etc.", "context": null
},
{
    "id": 341, "section": "3. Lengua y Gramática", "q": "¿Cuál es la forma correcta: 'haber' o 'a ver'?", "visual": null, "opts": ["'A ver qué pasa' (mirar); 'Debe haber solución' (existir)", "'Haber qué pasa'; 'Debe a ver solución'", "Son intercambiables"], "ans": 0, "expl": "A ver = mirar/comprobar. Haber = verbo auxiliar/existir.", "context": null
},
{
    "id": 342, "section": "3. Lengua y Gramática", "q": "¿Cuál oración usa correctamente la coma vocativa?", "visual": null, "opts": ["Juan, ven aquí", "Juan ven aquí", "Juan ven, aquí"], "ans": 0, "expl": "La coma vocativa separa el nombre de la persona a quien se habla.", "context": null
},
{
    "id": 343, "section": "3. Lengua y Gramática", "q": "¿Qué es un palíndromo?", "visual": null, "opts": ["Una palabra o frase que se lee igual al derecho y al revés", "Una palabra con doble significado", "Un error ortográfico"], "ans": 0, "expl": "Ej: 'Ana', 'reconocer', 'Anita lava la tina'.", "context": null
},

// =============================================
// EXÁMENES 3, 4 y 5: CIENCIA, CULTURA, RAZONAMIENTO (+360 preguntas)
// =============================================
{
    "id": 344,
    "section": "6. Física",
    "q": "¿Cuál es la partícula subatómica con carga negativa?",
    "visual": null,
    "opts": ["Protón","Neutrón","Electrón"],
    "ans": 2,
    "expl": "El electrón orbita el núcleo atómico.",
    "context": null
},
{
    "id": 345,
    "section": "6. Física",
    "q": "La ley de la gravitación universal fue formulada por:",
    "visual": null,
    "opts": ["Galileo","Newton","Einstein"],
    "ans": 1,
    "expl": "Newton describió la atracción entre masas.",
    "context": null
},
{
    "id": 346,
    "section": "6. Física",
    "q": "La velocidad de la luz en el vacío es aproximadamente:",
    "visual": null,
    "opts": ["300,000 km/s","150,000 km/s","1,000,000 km/s"],
    "ans": 0,
    "expl": "Valor exacto: 299,792 km/s.",
    "context": null
},
{
    "id": 347,
    "section": "6. Física",
    "q": "La primera ley de la termodinámica habla de:",
    "visual": null,
    "opts": ["Conservación de energía","Entropía","Cero absoluto"],
    "ans": 0,
    "expl": "La energía no se crea ni se destruye.",
    "context": null
},
{
    "id": 348,
    "section": "6. Física",
    "q": "¿Qué instrumento mide la corriente eléctrica?",
    "visual": null,
    "opts": ["Voltímetro","Amperímetro","Óhmetro"],
    "ans": 1,
    "expl": "Mide la intensidad en amperios.",
    "context": null
},
{
    "id": 349,
    "section": "6. Física",
    "q": "La energía cinética depende de:",
    "visual": null,
    "opts": ["Masa y velocidad","Altura y peso","Volumen y temperatura"],
    "ans": 0,
    "expl": "Ec = ½mv².",
    "context": null
},
{
    "id": 350,
    "section": "6. Física",
    "q": "¿Qué unidad mide la potencia eléctrica?",
    "visual": null,
    "opts": ["Voltio","Amperio","Vatio"],
    "ans": 2,
    "expl": "El vatio (W) es la unidad del SI.",
    "context": null
},
{
    "id": 351,
    "section": "6. Física",
    "q": "La gravedad en la Luna es aproximadamente:",
    "visual": null,
    "opts": ["1/6 de la Tierra","1/2 de la Tierra","Igual a la Tierra"],
    "ans": 0,
    "expl": "Por eso los astronautas saltan alto.",
    "context": null
},
{
    "id": 352,
    "section": "6. Física",
    "q": "El principio de incertidumbre fue propuesto por:",
    "visual": null,
    "opts": ["Bohr","Heisenberg","Schrödinger"],
    "ans": 1,
    "expl": "No se puede conocer posición y momento simultáneamente.",
    "context": null
},
{
    "id": 353,
    "section": "6. Física",
    "q": "¿Cuál es la unidad de fuerza en el SI?",
    "visual": null,
    "opts": ["Joule","Newton","Pascal"],
    "ans": 1,
    "expl": "Nombrada en honor a Isaac Newton.",
    "context": null
},
{
    "id": 354,
    "section": "6. Física",
    "q": "El sonido no se propaga en:",
    "visual": null,
    "opts": ["Agua","Aire","Vacío"],
    "ans": 2,
    "expl": "Necesita un medio material.",
    "context": null
},
{
    "id": 355,
    "section": "6. Física",
    "q": "La teoría de la relatividad especial fue publicada en:",
    "visual": null,
    "opts": ["1905","1915","1925"],
    "ans": 0,
    "expl": "Por Albert Einstein.",
    "context": null
},
{
    "id": 356,
    "section": "6. Física",
    "q": "La ley de Ohm relaciona:",
    "visual": null,
    "opts": ["Voltaje, corriente y resistencia","Masa y energía","Fuerza y aceleración"],
    "ans": 0,
    "expl": "V = I × R.",
    "context": null
},
{
    "id": 357,
    "section": "6. Física",
    "q": "¿Qué tipo de onda es la luz?",
    "visual": null,
    "opts": ["Longitudinal","Transversal electromagnética","Mecánica"],
    "ans": 1,
    "expl": "Oscila perpendicular a su propagación.",
    "context": null
},
{
    "id": 358,
    "section": "6. Física",
    "q": "La aceleración de la gravedad en la Tierra es:",
    "visual": null,
    "opts": ["9.8 m/s²","10.8 m/s²","8.9 m/s²"],
    "ans": 0,
    "expl": "Valor estándar usado en física.",
    "context": null
},
{
    "id": 359,
    "section": "6. Química",
    "q": "El símbolo químico del oro es:",
    "visual": null,
    "opts": ["Au","Ag","Or"],
    "ans": 0,
    "expl": "Del latín 'aurum'.",
    "context": null
},
{
    "id": 360,
    "section": "6. Química",
    "q": "El pH del agua pura es:",
    "visual": null,
    "opts": ["5","7","9"],
    "ans": 1,
    "expl": "Neutro en la escala pH.",
    "context": null
},
{
    "id": 361,
    "section": "6. Química",
    "q": "¿Cuál es el elemento más abundante en el universo?",
    "visual": null,
    "opts": ["Oxígeno","Hidrógeno","Helio"],
    "ans": 1,
    "expl": "Aproximadamente 75% de la materia.",
    "context": null
},
{
    "id": 362,
    "section": "6. Química",
    "q": "La tabla periódica fue organizada por:",
    "visual": null,
    "opts": ["Dalton","Mendeléyev","Bohr"],
    "ans": 1,
    "expl": "En 1869 publicó su versión.",
    "context": null
},
{
    "id": 363,
    "section": "6. Química",
    "q": "El agua está compuesta por:",
    "visual": null,
    "opts": ["1 H y 1 O","2 H y 1 O","1 H y 2 O"],
    "ans": 1,
    "expl": "Fórmula H₂O.",
    "context": null
},
{
    "id": 364,
    "section": "6. Química",
    "q": "¿Qué gas se libera en la fotosíntesis?",
    "visual": null,
    "opts": ["CO₂","O₂","N₂"],
    "ans": 1,
    "expl": "Las plantas liberan oxígeno.",
    "context": null
},
{
    "id": 365,
    "section": "6. Química",
    "q": "El número atómico representa:",
    "visual": null,
    "opts": ["Protones","Neutrones","Electrones libres"],
    "ans": 0,
    "expl": "Define el elemento.",
    "context": null
},
{
    "id": 366,
    "section": "6. Química",
    "q": "Un ácido fuerte es:",
    "visual": null,
    "opts": ["Ácido acético","Ácido clorhídrico","Ácido cítrico"],
    "ans": 1,
    "expl": "HCl se disocia completamente.",
    "context": null
},
{
    "id": 367,
    "section": "6. Química",
    "q": "El enlace iónico se forma entre:",
    "visual": null,
    "opts": ["Metales y no metales","Dos metales","Dos no metales"],
    "ans": 0,
    "expl": "Por transferencia de electrones.",
    "context": null
},
{
    "id": 368,
    "section": "6. Química",
    "q": "El isótopo radiactivo del carbono usado en datación es:",
    "visual": null,
    "opts": ["C-12","C-13","C-14"],
    "ans": 2,
    "expl": "Se desintegra con el tiempo.",
    "context": null
},
{
    "id": 369,
    "section": "6. Química",
    "q": "La reacción exotérmica:",
    "visual": null,
    "opts": ["Libera calor","Absorbe calor","No cambia energía"],
    "ans": 0,
    "expl": "Ejemplo: combustión.",
    "context": null
},
{
    "id": 370,
    "section": "6. Química",
    "q": "El gas noble más liviano es:",
    "visual": null,
    "opts": ["Neón","Argón","Helio"],
    "ans": 2,
    "expl": "Número atómico 2.",
    "context": null
},
{
    "id": 371,
    "section": "6. Química",
    "q": "La concentración molar se mide en:",
    "visual": null,
    "opts": ["g/L","mol/L","kg/L"],
    "ans": 1,
    "expl": "Molaridad (M).",
    "context": null
},
{
    "id": 372,
    "section": "6. Química",
    "q": "El metal líquido a temperatura ambiente es:",
    "visual": null,
    "opts": ["Hierro","Mercurio","Plomo"],
    "ans": 1,
    "expl": "Símbolo Hg.",
    "context": null
},
{
    "id": 373,
    "section": "6. Química",
    "q": "La oxidación es una pérdida de:",
    "visual": null,
    "opts": ["Protones","Electrones","Neutrones"],
    "ans": 1,
    "expl": "En química redox.",
    "context": null
},
{
    "id": 374,
    "section": "6. Biología",
    "q": "La unidad básica de la vida es:",
    "visual": null,
    "opts": ["Átomo","Célula","Tejido"],
    "ans": 1,
    "expl": "Unidad funcional de los seres vivos.",
    "context": null
},
{
    "id": 375,
    "section": "6. Biología",
    "q": "El ADN tiene estructura de:",
    "visual": null,
    "opts": ["Triple hélice","Doble hélice","Cadena simple"],
    "ans": 1,
    "expl": "Descubierta por Watson y Crick.",
    "context": null
},
{
    "id": 376,
    "section": "6. Biología",
    "q": "La fotosíntesis ocurre en:",
    "visual": null,
    "opts": ["Mitocondrias","Cloroplastos","Ribosomas"],
    "ans": 1,
    "expl": "Orgánulos de células vegetales.",
    "context": null
},
{
    "id": 377,
    "section": "6. Biología",
    "q": "El órgano más grande del cuerpo humano es:",
    "visual": null,
    "opts": ["Hígado","Piel","Intestino"],
    "ans": 1,
    "expl": "Protege contra el medio externo.",
    "context": null
},
{
    "id": 378,
    "section": "6. Biología",
    "q": "¿Cuántos cromosomas tiene un humano?",
    "visual": null,
    "opts": ["23","44","46"],
    "ans": 2,
    "expl": "23 pares.",
    "context": null
},
{
    "id": 379,
    "section": "6. Biología",
    "q": "La insulina se produce en el:",
    "visual": null,
    "opts": ["Hígado","Páncreas","Riñón"],
    "ans": 1,
    "expl": "En las células beta de los islotes de Langerhans.",
    "context": null
},
{
    "id": 380,
    "section": "6. Biología",
    "q": "El proceso de división celular que produce gametos es:",
    "visual": null,
    "opts": ["Mitosis","Meiosis","Citocinesis"],
    "ans": 1,
    "expl": "Reduce a la mitad el número de cromosomas.",
    "context": null
},
{
    "id": 381,
    "section": "6. Biología",
    "q": "Las bacterias son organismos:",
    "visual": null,
    "opts": ["Eucariotas","Procariotas","Multicelulares"],
    "ans": 1,
    "expl": "No tienen núcleo definido.",
    "context": null
},
{
    "id": 382,
    "section": "6. Biología",
    "q": "La selección natural fue propuesta por:",
    "visual": null,
    "opts": ["Darwin","Lamarck","Mendel"],
    "ans": 0,
    "expl": "Base de la evolución.",
    "context": null
},
{
    "id": 383,
    "section": "6. Biología",
    "q": "El hueso más largo del cuerpo humano es:",
    "visual": null,
    "opts": ["Tibia","Fémur","Húmero"],
    "ans": 1,
    "expl": "En el muslo.",
    "context": null
},
{
    "id": 384,
    "section": "6. Biología",
    "q": "El grupo sanguíneo universal donador es:",
    "visual": null,
    "opts": ["A+","AB+","O-"],
    "ans": 2,
    "expl": "No tiene antígenos A ni B.",
    "context": null
},
{
    "id": 385,
    "section": "6. Biología",
    "q": "La vacuna fue descubierta por:",
    "visual": null,
    "opts": ["Pasteur","Jenner","Koch"],
    "ans": 1,
    "expl": "Edward Jenner contra la viruela (1796).",
    "context": null
},
{
    "id": 386,
    "section": "6. Biología",
    "q": "El ecosistema con mayor biodiversidad es:",
    "visual": null,
    "opts": ["Desierto","Bosque tropical","Tundra"],
    "ans": 1,
    "expl": "Climas cálidos y húmedos.",
    "context": null
},
{
    "id": 387,
    "section": "6. Biología",
    "q": "Las mitocondrias se conocen como:",
    "visual": null,
    "opts": ["Centro de control","Centrales energéticas","Almacenes"],
    "ans": 1,
    "expl": "Producen ATP.",
    "context": null
},
{
    "id": 388,
    "section": "6. Biología",
    "q": "La penicilina fue descubierta por:",
    "visual": null,
    "opts": ["Fleming","Pasteur","Koch"],
    "ans": 0,
    "expl": "En 1928 por accidente.",
    "context": null
},
{
    "id": 389,
    "section": "6. Biología",
    "q": "Los genes se encuentran en:",
    "visual": null,
    "opts": ["Proteínas","Cromosomas","Lípidos"],
    "ans": 1,
    "expl": "Contienen el ADN.",
    "context": null
},
{
    "id": 390,
    "section": "6. Biología",
    "q": "El mamífero más grande del mundo es:",
    "visual": null,
    "opts": ["Elefante","Ballena azul","Jirafa"],
    "ans": 1,
    "expl": "Puede medir hasta 30 metros.",
    "context": null
},
{
    "id": 391,
    "section": "6. Biología",
    "q": "La respiración celular produce:",
    "visual": null,
    "opts": ["Oxígeno","ATP y CO₂","Glucosa"],
    "ans": 1,
    "expl": "Energía para la célula.",
    "context": null
},
{
    "id": 392,
    "section": "6. Biología",
    "q": "El sistema que transporta nutrientes es:",
    "visual": null,
    "opts": ["Digestivo","Circulatorio","Excretor"],
    "ans": 1,
    "expl": "Sangre y linfa.",
    "context": null
},
{
    "id": 393,
    "section": "6. Biología",
    "q": "La homeostasis se refiere a:",
    "visual": null,
    "opts": ["Reproducción","Equilibrio interno","Crecimiento"],
    "ans": 1,
    "expl": "Regulación del ambiente interno.",
    "context": null
},
{
    "id": 394,
    "section": "7. Tecnología e Informática",
    "q": "HTML significa:",
    "visual": null,
    "opts": ["HyperText Markup Language","High Text Modern Language","Home Tool ML"],
    "ans": 0,
    "expl": "Lenguaje para páginas web.",
    "context": null
},
{
    "id": 395,
    "section": "7. Tecnología e Informática",
    "q": "El cofundador de Microsoft es:",
    "visual": null,
    "opts": ["Steve Jobs","Bill Gates","Elon Musk"],
    "ans": 1,
    "expl": "Junto a Paul Allen en 1975.",
    "context": null
},
{
    "id": 396,
    "section": "7. Tecnología e Informática",
    "q": "El primer iPhone se lanzó en:",
    "visual": null,
    "opts": ["2005","2007","2009"],
    "ans": 1,
    "expl": "Revolucionó la telefonía.",
    "context": null
},
{
    "id": 397,
    "section": "7. Tecnología e Informática",
    "q": "Python es popular en:",
    "visual": null,
    "opts": ["Videojuegos AAA","IA y ciencia de datos","Sistemas embebidos"],
    "ans": 1,
    "expl": "Por su facilidad y librerías.",
    "context": null
},
{
    "id": 398,
    "section": "7. Tecnología e Informática",
    "q": "Android fue desarrollado por:",
    "visual": null,
    "opts": ["Apple","Google","Microsoft"],
    "ans": 1,
    "expl": "Adquirido en 2005.",
    "context": null
},
{
    "id": 399,
    "section": "7. Tecnología e Informática",
    "q": "CPU significa:",
    "visual": null,
    "opts": ["Central Processing Unit","Computer Personal Unit","Central Program Unit"],
    "ans": 0,
    "expl": "Procesador principal.",
    "context": null
},
{
    "id": 400,
    "section": "7. Tecnología e Informática",
    "q": "La red social de Mark Zuckerberg es:",
    "visual": null,
    "opts": ["Twitter","Facebook","Instagram"],
    "ans": 1,
    "expl": "Fundada en 2004.",
    "context": null
},
{
    "id": 401,
    "section": "7. Tecnología e Informática",
    "q": "El protocolo para enviar emails es:",
    "visual": null,
    "opts": ["HTTP","FTP","SMTP"],
    "ans": 2,
    "expl": "Simple Mail Transfer Protocol.",
    "context": null
},
{
    "id": 402,
    "section": "7. Tecnología e Informática",
    "q": "RAM significa:",
    "visual": null,
    "opts": ["Random Access Memory","Read Access Memory","Run App Memory"],
    "ans": 0,
    "expl": "Memoria de acceso aleatorio.",
    "context": null
},
{
    "id": 403,
    "section": "7. Tecnología e Informática",
    "q": "El padre de la computación moderna es:",
    "visual": null,
    "opts": ["Babbage","Turing","von Neumann"],
    "ans": 1,
    "expl": "Alan Turing con su máquina teórica.",
    "context": null
},
{
    "id": 404,
    "section": "7. Tecnología e Informática",
    "q": "Java fue creado originalmente por:",
    "visual": null,
    "opts": ["Microsoft","Sun Microsystems","IBM"],
    "ans": 1,
    "expl": "Luego adquirido por Oracle.",
    "context": null
},
{
    "id": 405,
    "section": "7. Tecnología e Informática",
    "q": "WWW significa:",
    "visual": null,
    "opts": ["World Wide Web","Web World Wide","Wide Web World"],
    "ans": 0,
    "expl": "Inventada por Berners-Lee.",
    "context": null
},
{
    "id": 406,
    "section": "7. Tecnología e Informática",
    "q": "Linux es un:",
    "visual": null,
    "opts": ["Navegador","Sistema operativo","Procesador"],
    "ans": 1,
    "expl": "De código abierto, creado por Linus Torvalds.",
    "context": null
},
{
    "id": 407,
    "section": "7. Tecnología e Informática",
    "q": "Un algoritmo es:",
    "visual": null,
    "opts": ["Un hardware","Una secuencia de pasos","Una base de datos"],
    "ans": 1,
    "expl": "Para resolver problemas.",
    "context": null
},
{
    "id": 408,
    "section": "7. Tecnología e Informática",
    "q": "La nube (cloud) permite:",
    "visual": null,
    "opts": ["Almacenamiento remoto","Minar criptomonedas","Navegar sin internet"],
    "ans": 0,
    "expl": "Acceder a recursos por internet.",
    "context": null
},
{
    "id": 409,
    "section": "7. Tecnología e Informática",
    "q": "Blockchain es la base de:",
    "visual": null,
    "opts": ["IA","Criptomonedas","VR"],
    "ans": 1,
    "expl": "Registro distribuido seguro.",
    "context": null
},
{
    "id": 410,
    "section": "7. Tecnología e Informática",
    "q": "El lenguaje de estilo para web es:",
    "visual": null,
    "opts": ["HTML","CSS","JS"],
    "ans": 1,
    "expl": "Cascading Style Sheets.",
    "context": null
},
{
    "id": 411,
    "section": "7. Tecnología e Informática",
    "q": "JavaScript fue creado por:",
    "visual": null,
    "opts": ["Netscape","Microsoft","Apple"],
    "ans": 0,
    "expl": "Brendan Eich en 1995.",
    "context": null
},
{
    "id": 412,
    "section": "7. Tecnología e Informática",
    "q": "Un byte tiene:",
    "visual": null,
    "opts": ["4 bits","8 bits","16 bits"],
    "ans": 1,
    "expl": "Unidad básica de información.",
    "context": null
},
{
    "id": 413,
    "section": "7. Tecnología e Informática",
    "q": "El navegador más usado en 2025 es:",
    "visual": null,
    "opts": ["Firefox","Chrome","Edge"],
    "ans": 1,
    "expl": "De Google.",
    "context": null
},
{
    "id": 414,
    "section": "7. Tecnología e Informática",
    "q": "La inteligencia artificial usa:",
    "visual": null,
    "opts": ["Redes neuronales","Códigos morse","Papel"],
    "ans": 0,
    "expl": "Imitan el cerebro humano.",
    "context": null
},
{
    "id": 415,
    "section": "7. Tecnología e Informática",
    "q": "Un SSD es más rápido que un HDD porque:",
    "visual": null,
    "opts": ["Tiene partes móviles","No tiene partes móviles","Usa cinta"],
    "ans": 1,
    "expl": "Memoria flash.",
    "context": null
},
{
    "id": 416,
    "section": "7. Tecnología e Informática",
    "q": "El creador de Tesla es:",
    "visual": null,
    "opts": ["Bezos","Musk","Gates"],
    "ans": 1,
    "expl": "Elon Musk.",
    "context": null
},
{
    "id": 417,
    "section": "7. Tecnología e Informática",
    "q": "GitHub es una plataforma para:",
    "visual": null,
    "opts": ["Videos","Código fuente","Emails"],
    "ans": 1,
    "expl": "Control de versiones.",
    "context": null
},
{
    "id": 418,
    "section": "7. Tecnología e Informática",
    "q": "ChatGPT fue lanzado por:",
    "visual": null,
    "opts": ["Google","OpenAI","Microsoft"],
    "ans": 1,
    "expl": "En noviembre de 2022.",
    "context": null
},
{
    "id": 419,
    "section": "8. Astronomía",
    "q": "¿Cuántos planetas tiene el sistema solar?",
    "visual": null,
    "opts": ["7","8","9"],
    "ans": 1,
    "expl": "Desde 2006 Plutón es planeta enano.",
    "context": null
},
{
    "id": 420,
    "section": "8. Astronomía",
    "q": "El planeta rojo es:",
    "visual": null,
    "opts": ["Venus","Marte","Júpiter"],
    "ans": 1,
    "expl": "Por el óxido de hierro.",
    "context": null
},
{
    "id": 421,
    "section": "8. Astronomía",
    "q": "La galaxia donde estamos es:",
    "visual": null,
    "opts": ["Andrómeda","Vía Láctea","Triángulo"],
    "ans": 1,
    "expl": "Nuestro hogar cósmico.",
    "context": null
},
{
    "id": 422,
    "section": "8. Astronomía",
    "q": "El Sol es una:",
    "visual": null,
    "opts": ["Planeta","Estrella","Nebulosa"],
    "ans": 1,
    "expl": "De tipo G (enana amarilla).",
    "context": null
},
{
    "id": 423,
    "section": "8. Astronomía",
    "q": "El satélite natural de la Tierra es:",
    "visual": null,
    "opts": ["Fobos","Luna","Titán"],
    "ans": 1,
    "expl": "Única luna natural.",
    "context": null
},
{
    "id": 424,
    "section": "8. Astronomía",
    "q": "El planeta más grande es:",
    "visual": null,
    "opts": ["Saturno","Júpiter","Urano"],
    "ans": 1,
    "expl": "Gigante gaseoso.",
    "context": null
},
{
    "id": 425,
    "section": "8. Astronomía",
    "q": "Un agujero negro:",
    "visual": null,
    "opts": ["Emite luz","Absorbe todo, incluida la luz","Es una estrella"],
    "ans": 1,
    "expl": "Gravedad extrema.",
    "context": null
},
{
    "id": 426,
    "section": "8. Astronomía",
    "q": "La teoría del Big Bang explica:",
    "visual": null,
    "opts": ["La muerte de estrellas","El origen del universo","La formación de planetas"],
    "ans": 1,
    "expl": "Hace 13,800 millones de años.",
    "context": null
},
{
    "id": 427,
    "section": "8. Astronomía",
    "q": "El primer astronauta en el espacio fue:",
    "visual": null,
    "opts": ["Armstrong","Gagarin","Glenn"],
    "ans": 1,
    "expl": "Yuri Gagarin (1961).",
    "context": null
},
{
    "id": 428,
    "section": "8. Astronomía",
    "q": "El primer hombre en la Luna fue:",
    "visual": null,
    "opts": ["Neil Armstrong","Buzz Aldrin","John Glenn"],
    "ans": 0,
    "expl": "Apollo 11 en 1969.",
    "context": null
},
{
    "id": 429,
    "section": "8. Astronomía",
    "q": "Los anillos más famosos son de:",
    "visual": null,
    "opts": ["Júpiter","Saturno","Urano"],
    "ans": 1,
    "expl": "De hielo y roca.",
    "context": null
},
{
    "id": 430,
    "section": "8. Astronomía",
    "q": "La unidad astronómica (AU) mide distancia a:",
    "visual": null,
    "opts": ["La Luna","El Sol","La estrella más cercana"],
    "ans": 1,
    "expl": "150 millones de km.",
    "context": null
},
{
    "id": 431,
    "section": "8. Astronomía",
    "q": "Un año luz mide:",
    "visual": null,
    "opts": ["Tiempo","Distancia","Velocidad"],
    "ans": 1,
    "expl": "9.46 billones de km.",
    "context": null
},
{
    "id": 432,
    "section": "8. Astronomía",
    "q": "El telescopio espacial más famoso es:",
    "visual": null,
    "opts": ["Spitzer","Hubble","Kepler"],
    "ans": 1,
    "expl": "Lanzado en 1990.",
    "context": null
},
{
    "id": 433,
    "section": "8. Astronomía",
    "q": "Las constelaciones son:",
    "visual": null,
    "opts": ["Galaxias","Agrupaciones visuales de estrellas","Planetas"],
    "ans": 1,
    "expl": "Patrones en el cielo.",
    "context": null
},
{
    "id": 434,
    "section": "9. Matemáticas Aplicadas",
    "q": "La desviación estándar mide:",
    "visual": null,
    "opts": ["Centro","Dispersión","Tendencia"],
    "ans": 1,
    "expl": "Variabilidad de datos.",
    "context": null
},
{
    "id": 435,
    "section": "9. Matemáticas Aplicadas",
    "q": "La derivada representa:",
    "visual": null,
    "opts": ["Área","Pendiente tangente","Máximo"],
    "ans": 1,
    "expl": "Tasa de cambio.",
    "context": null
},
{
    "id": 436,
    "section": "9. Matemáticas Aplicadas",
    "q": "Si P=0.75, la probabilidad complementaria es:",
    "visual": null,
    "opts": ["0.25","0.5","0.75"],
    "ans": 0,
    "expl": "1 - 0.75.",
    "context": null
},
{
    "id": 437,
    "section": "9. Matemáticas Aplicadas",
    "q": "0.00045 en notación científica:",
    "visual": null,
    "opts": ["4.5×10⁻⁴","45×10⁻⁵","0.45×10⁻³"],
    "ans": 0,
    "expl": "4 lugares a la derecha.",
    "context": null
},
{
    "id": 438,
    "section": "9. Matemáticas Aplicadas",
    "q": "Correlación positiva significa:",
    "visual": null,
    "opts": ["Ambas bajan","Una sube, otra baja","Ambas suben"],
    "ans": 2,
    "expl": "Relación directa.",
    "context": null
},
{
    "id": 439,
    "section": "9. Matemáticas Aplicadas",
    "q": "El valor de Pi (π) aproximado es:",
    "visual": null,
    "opts": ["3.14","3.12","3.16"],
    "ans": 0,
    "expl": "Relación circunferencia/diámetro.",
    "context": null
},
{
    "id": 440,
    "section": "9. Matemáticas Aplicadas",
    "q": "La raíz cuadrada de 144 es:",
    "visual": null,
    "opts": ["10","12","14"],
    "ans": 1,
    "expl": "12×12 = 144.",
    "context": null
},
{
    "id": 441,
    "section": "9. Matemáticas Aplicadas",
    "q": "El número primo más pequeño es:",
    "visual": null,
    "opts": ["1","2","3"],
    "ans": 1,
    "expl": "Único primo par.",
    "context": null
},
{
    "id": 442,
    "section": "9. Matemáticas Aplicadas",
    "q": "Un hexágono tiene:",
    "visual": null,
    "opts": ["5 lados","6 lados","8 lados"],
    "ans": 1,
    "expl": "Polígono de 6 lados.",
    "context": null
},
{
    "id": 443,
    "section": "9. Matemáticas Aplicadas",
    "q": "15 × 15 es igual a:",
    "visual": null,
    "opts": ["215","225","235"],
    "ans": 1,
    "expl": "Cuadrado de 15.",
    "context": null
},
{
    "id": 444,
    "section": "9. Matemáticas Aplicadas",
    "q": "Un ángulo recto tiene:",
    "visual": null,
    "opts": ["45°","90°","180°"],
    "ans": 1,
    "expl": "Ángulo de referencia.",
    "context": null
},
{
    "id": 445,
    "section": "9. Matemáticas Aplicadas",
    "q": "En 1 metro hay:",
    "visual": null,
    "opts": ["100 mm","1000 mm","10 mm"],
    "ans": 1,
    "expl": "1000 milímetros.",
    "context": null
},
{
    "id": 446,
    "section": "9. Matemáticas Aplicadas",
    "q": "El número romano L vale:",
    "visual": null,
    "opts": ["10","50","100"],
    "ans": 1,
    "expl": "Cincuenta.",
    "context": null
},
{
    "id": 447,
    "section": "9. Matemáticas Aplicadas",
    "q": "La secuencia 2, 4, 8, 16 sigue con:",
    "visual": null,
    "opts": ["24","32","64"],
    "ans": 1,
    "expl": "Se duplica cada vez.",
    "context": null
},
{
    "id": 448,
    "section": "9. Matemáticas Aplicadas",
    "q": "100 ÷ 4 es:",
    "visual": null,
    "opts": ["20","25","30"],
    "ans": 1,
    "expl": "División exacta.",
    "context": null
},
{
    "id": 449,
    "section": "10. Innovación y Descubrimientos",
    "q": "Marie Curie estudió la:",
    "visual": null,
    "opts": ["Electricidad","Radioactividad","Genética"],
    "ans": 1,
    "expl": "Dos premios Nobel.",
    "context": null
},
{
    "id": 450,
    "section": "10. Innovación y Descubrimientos",
    "q": "El primer satélite artificial fue:",
    "visual": null,
    "opts": ["Apollo","Sputnik","Voyager"],
    "ans": 1,
    "expl": "URSS, 1957.",
    "context": null
},
{
    "id": 451,
    "section": "10. Innovación y Descubrimientos",
    "q": "Tim Berners-Lee inventó:",
    "visual": null,
    "opts": ["PC","WWW","Java"],
    "ans": 1,
    "expl": "La World Wide Web (1989).",
    "context": null
},
{
    "id": 452,
    "section": "10. Innovación y Descubrimientos",
    "q": "El láser fue inventado en:",
    "visual": null,
    "opts": ["1950","1960","1970"],
    "ans": 1,
    "expl": "Por Theodore Maiman.",
    "context": null
},
{
    "id": 453,
    "section": "10. Innovación y Descubrimientos",
    "q": "La fibra óptica usa:",
    "visual": null,
    "opts": ["Electricidad","Luz","Ondas de radio"],
    "ans": 1,
    "expl": "Transmisión por pulsos lumínicos.",
    "context": null
},
{
    "id": 454,
    "section": "10. Innovación y Descubrimientos",
    "q": "El primer transistor se inventó en:",
    "visual": null,
    "opts": ["1937","1947","1957"],
    "ans": 1,
    "expl": "Laboratorios Bell.",
    "context": null
},
{
    "id": 455,
    "section": "10. Innovación y Descubrimientos",
    "q": "La vacuna contra la polio fue desarrollada por:",
    "visual": null,
    "opts": ["Salk","Pasteur","Jenner"],
    "ans": 0,
    "expl": "Jonas Salk en 1955.",
    "context": null
},
{
    "id": 456,
    "section": "10. Innovación y Descubrimientos",
    "q": "El GPS fue desarrollado originalmente para:",
    "visual": null,
    "opts": ["Navegación civil","Uso militar","Coches autónomos"],
    "ans": 1,
    "expl": "Por el Departamento de Defensa de EE.UU.",
    "context": null
},
{
    "id": 457,
    "section": "10. Innovación y Descubrimientos",
    "q": "El grafeno es un material hecho de:",
    "visual": null,
    "opts": ["Silicio","Carbono","Hierro"],
    "ans": 1,
    "expl": "Átomos de carbono en red hexagonal.",
    "context": null
},
{
    "id": 458,
    "section": "10. Innovación y Descubrimientos",
    "q": "La primera computadora electrónica fue:",
    "visual": null,
    "opts": ["ENIAC","Apple I","IBM PC"],
    "ans": 0,
    "expl": "1946 en la Universidad de Pensilvania.",
    "context": null
},
{
    "id": 459,
    "section": "10. Innovación y Descubrimientos",
    "q": "Nikola Tesla trabajó con:",
    "visual": null,
    "opts": ["Corriente alterna","Corriente continua","Energía nuclear"],
    "ans": 0,
    "expl": "Contra Edison.",
    "context": null
},
{
    "id": 460,
    "section": "10. Innovación y Descubrimientos",
    "q": "El descubrimiento de los rayos X fue de:",
    "visual": null,
    "opts": ["Röntgen","Curie","Becquerel"],
    "ans": 0,
    "expl": "Wilhelm Röntgen (1895).",
    "context": null
},
{
    "id": 461,
    "section": "10. Innovación y Descubrimientos",
    "q": "La secuenciación del genoma humano se completó en:",
    "visual": null,
    "opts": ["1993","2003","2013"],
    "ans": 1,
    "expl": "Proyecto del Genoma Humano.",
    "context": null
},
{
    "id": 462,
    "section": "10. Innovación y Descubrimientos",
    "q": "Los coches eléctricos modernos usan baterías de:",
    "visual": null,
    "opts": ["Plomo","Ion-litio","Níquel-cadmio"],
    "ans": 1,
    "expl": "Alta densidad energética.",
    "context": null
},
{
    "id": 463,
    "section": "10. Innovación y Descubrimientos",
    "q": "La impresión 3D permite fabricar:",
    "visual": null,
    "opts": ["Solo plástico","Objetos capa por capa en diversos materiales","Solo metal"],
    "ans": 1,
    "expl": "Manufactura aditiva.",
    "context": null
},
{
    "id": 464,
    "section": "11. Historia Universal",
    "q": "La Revolución Francesa comenzó en:",
    "visual": null,
    "opts": ["1776","1789","1804"],
    "ans": 1,
    "expl": "Toma de la Bastilla.",
    "context": null
},
{
    "id": 465,
    "section": "11. Historia Universal",
    "q": "El imperio romano fue gobernado por:",
    "visual": null,
    "opts": ["Augusto","Alejandro","Napoleón"],
    "ans": 0,
    "expl": "Primer emperador romano.",
    "context": null
},
{
    "id": 466,
    "section": "11. Historia Universal",
    "q": "Colón llegó a América en:",
    "visual": null,
    "opts": ["1490","1492","1500"],
    "ans": 1,
    "expl": "12 de octubre de 1492.",
    "context": null
},
{
    "id": 467,
    "section": "11. Historia Universal",
    "q": "El primer presidente de EE.UU. fue:",
    "visual": null,
    "opts": ["Jefferson","Washington","Lincoln"],
    "ans": 1,
    "expl": "George Washington (1789).",
    "context": null
},
{
    "id": 468,
    "section": "11. Historia Universal",
    "q": "La Primera Guerra Mundial comenzó en:",
    "visual": null,
    "opts": ["1912","1914","1918"],
    "ans": 1,
    "expl": "Tras el asesinato del archiduque Francisco Fernando.",
    "context": null
},
{
    "id": 469,
    "section": "11. Historia Universal",
    "q": "El Muro de Berlín cayó en:",
    "visual": null,
    "opts": ["1987","1989","1991"],
    "ans": 1,
    "expl": "9 de noviembre de 1989.",
    "context": null
},
{
    "id": 470,
    "section": "11. Historia Universal",
    "q": "Julio César gobernó el Imperio:",
    "visual": null,
    "opts": ["Griego","Romano","Persa"],
    "ans": 1,
    "expl": "Dictador romano.",
    "context": null
},
{
    "id": 471,
    "section": "11. Historia Universal",
    "q": "El Manifiesto Comunista lo escribieron Marx y:",
    "visual": null,
    "opts": ["Lenin","Engels","Stalin"],
    "ans": 1,
    "expl": "Friedrich Engels (1848).",
    "context": null
},
{
    "id": 472,
    "section": "11. Historia Universal",
    "q": "La independencia de México comenzó en:",
    "visual": null,
    "opts": ["1808","1810","1821"],
    "ans": 1,
    "expl": "Grito de Dolores (16 de septiembre).",
    "context": null
},
{
    "id": 473,
    "section": "11. Historia Universal",
    "q": "El líder de la Revolución Cubana fue:",
    "visual": null,
    "opts": ["Che Guevara","Fidel Castro","Raúl"],
    "ans": 1,
    "expl": "Fidel Castro (1959).",
    "context": null
},
{
    "id": 474,
    "section": "11. Historia Universal",
    "q": "El primer país en la Luna fue:",
    "visual": null,
    "opts": ["URSS","China","EE.UU."],
    "ans": 2,
    "expl": "Apollo 11 (1969).",
    "context": null
},
{
    "id": 475,
    "section": "11. Historia Universal",
    "q": "La Segunda Guerra Mundial terminó en:",
    "visual": null,
    "opts": ["1943","1945","1947"],
    "ans": 1,
    "expl": "Rendición de Japón en agosto de 1945.",
    "context": null
},
{
    "id": 476,
    "section": "11. Historia Universal",
    "q": "Napoleón Bonaparte fue emperador de:",
    "visual": null,
    "opts": ["España","Francia","Italia"],
    "ans": 1,
    "expl": "Emperador de los franceses.",
    "context": null
},
{
    "id": 477,
    "section": "11. Historia Universal",
    "q": "La Gran Depresión comenzó en:",
    "visual": null,
    "opts": ["1925","1929","1933"],
    "ans": 1,
    "expl": "Crack del 29.",
    "context": null
},
{
    "id": 478,
    "section": "11. Historia Universal",
    "q": "El primer avión voló en:",
    "visual": null,
    "opts": ["1899","1903","1907"],
    "ans": 1,
    "expl": "Hermanos Wright.",
    "context": null
},
{
    "id": 479,
    "section": "11. Historia Universal",
    "q": "El Titanic se hundió en:",
    "visual": null,
    "opts": ["1910","1912","1914"],
    "ans": 1,
    "expl": "15 de abril de 1912.",
    "context": null
},
{
    "id": 480,
    "section": "11. Historia Universal",
    "q": "Las pirámides de Giza fueron construidas por:",
    "visual": null,
    "opts": ["Griegos","Egipcios","Romanos"],
    "ans": 1,
    "expl": "Antiguo Egipto.",
    "context": null
},
{
    "id": 481,
    "section": "11. Historia Universal",
    "q": "La Guerra Fría enfrentó a:",
    "visual": null,
    "opts": ["EE.UU. y URSS","Francia y Alemania","China y Japón"],
    "ans": 0,
    "expl": "1947-1991.",
    "context": null
},
{
    "id": 482,
    "section": "11. Historia Universal",
    "q": "El Renacimiento surgió en:",
    "visual": null,
    "opts": ["Francia","Italia","España"],
    "ans": 1,
    "expl": "Florencia, siglo XIV.",
    "context": null
},
{
    "id": 483,
    "section": "11. Historia Universal",
    "q": "Nelson Mandela luchó contra:",
    "visual": null,
    "opts": ["Apartheid","Comunismo","Monarquía"],
    "ans": 0,
    "expl": "Sudáfrica.",
    "context": null
},
{
    "id": 484,
    "section": "11. Historia Universal",
    "q": "Mahoma fundó:",
    "visual": null,
    "opts": ["Cristianismo","Islam","Budismo"],
    "ans": 1,
    "expl": "Siglo VII en Arabia.",
    "context": null
},
{
    "id": 485,
    "section": "11. Historia Universal",
    "q": "El Imperio Inca tenía su capital en:",
    "visual": null,
    "opts": ["México","Cusco","Machu Picchu"],
    "ans": 1,
    "expl": "Actual Perú.",
    "context": null
},
{
    "id": 486,
    "section": "11. Historia Universal",
    "q": "Gandhi practicó la:",
    "visual": null,
    "opts": ["Violencia","No violencia","Guerra"],
    "ans": 1,
    "expl": "Satyagraha.",
    "context": null
},
{
    "id": 487,
    "section": "11. Historia Universal",
    "q": "La bomba atómica se usó en:",
    "visual": null,
    "opts": ["Tokio","Hiroshima","Kioto"],
    "ans": 1,
    "expl": "6 de agosto de 1945.",
    "context": null
},
{
    "id": 488,
    "section": "11. Historia Universal",
    "q": "La Revolución Industrial comenzó en:",
    "visual": null,
    "opts": ["Francia","Inglaterra","Alemania"],
    "ans": 1,
    "expl": "Siglo XVIII.",
    "context": null
},
{
    "id": 489,
    "section": "12. Geografía Mundial",
    "q": "El río más largo del mundo es:",
    "visual": null,
    "opts": ["Nilo","Amazonas","Yangtsé"],
    "ans": 1,
    "expl": "Según estudios recientes.",
    "context": null
},
{
    "id": 490,
    "section": "12. Geografía Mundial",
    "q": "El país más grande del mundo es:",
    "visual": null,
    "opts": ["Canadá","China","Rusia"],
    "ans": 2,
    "expl": "17.1 millones km².",
    "context": null
},
{
    "id": 491,
    "section": "12. Geografía Mundial",
    "q": "La capital de Australia es:",
    "visual": null,
    "opts": ["Sídney","Canberra","Melbourne"],
    "ans": 1,
    "expl": "No Sídney.",
    "context": null
},
{
    "id": 492,
    "section": "12. Geografía Mundial",
    "q": "El Sahara está en:",
    "visual": null,
    "opts": ["Asia","África","América"],
    "ans": 1,
    "expl": "Norte de África.",
    "context": null
},
{
    "id": 493,
    "section": "12. Geografía Mundial",
    "q": "El océano más grande es:",
    "visual": null,
    "opts": ["Atlántico","Pacífico","Índico"],
    "ans": 1,
    "expl": "Cubre 1/3 de la Tierra.",
    "context": null
},
{
    "id": 494,
    "section": "12. Geografía Mundial",
    "q": "Italia tiene forma de:",
    "visual": null,
    "opts": ["Bota","Triángulo","Círculo"],
    "ans": 0,
    "expl": "Península itálica.",
    "context": null
},
{
    "id": 495,
    "section": "12. Geografía Mundial",
    "q": "La montaña más alta es:",
    "visual": null,
    "opts": ["Everest","K2","Aconcagua"],
    "ans": 0,
    "expl": "8,848 m.",
    "context": null
},
{
    "id": 496,
    "section": "12. Geografía Mundial",
    "q": "El país más poblado (2024):",
    "visual": null,
    "opts": ["China","India","EE.UU."],
    "ans": 1,
    "expl": "India superó a China.",
    "context": null
},
{
    "id": 497,
    "section": "12. Geografía Mundial",
    "q": "La Torre Eiffel está en:",
    "visual": null,
    "opts": ["Roma","París","Madrid"],
    "ans": 1,
    "expl": "Construida en 1889.",
    "context": null
},
{
    "id": 498,
    "section": "12. Geografía Mundial",
    "q": "La capital de Japón es:",
    "visual": null,
    "opts": ["Tokio","Kioto","Osaka"],
    "ans": 0,
    "expl": "Desde 1868.",
    "context": null
},
{
    "id": 499,
    "section": "12. Geografía Mundial",
    "q": "El estrecho entre Europa y África es:",
    "visual": null,
    "opts": ["Bósforo","Gibraltar","Malaca"],
    "ans": 1,
    "expl": "14 km de ancho.",
    "context": null
},
{
    "id": 500,
    "section": "12. Geografía Mundial",
    "q": "El lago más alto de Sudamérica es:",
    "visual": null,
    "opts": ["Maracaibo","Titicaca","Poopó"],
    "ans": 1,
    "expl": "3,812 m s.n.m.",
    "context": null
},
{
    "id": 501,
    "section": "12. Geografía Mundial",
    "q": "El desierto de Atacama está en:",
    "visual": null,
    "opts": ["Chile","Perú","Argentina"],
    "ans": 0,
    "expl": "El más seco del mundo.",
    "context": null
},
{
    "id": 502,
    "section": "12. Geografía Mundial",
    "q": "La capital de Canadá es:",
    "visual": null,
    "opts": ["Toronto","Ottawa","Vancouver"],
    "ans": 1,
    "expl": "No Toronto.",
    "context": null
},
{
    "id": 503,
    "section": "12. Geografía Mundial",
    "q": "El volcán más alto del mundo es:",
    "visual": null,
    "opts": ["Ojos del Salado","Chimborazo","Kilimanjaro"],
    "ans": 0,
    "expl": "Entre Chile y Argentina.",
    "context": null
},
{
    "id": 504,
    "section": "12. Geografía Mundial",
    "q": "Machu Picchu está en:",
    "visual": null,
    "opts": ["México","Perú","Bolivia"],
    "ans": 1,
    "expl": "Cordillera de los Andes.",
    "context": null
},
{
    "id": 505,
    "section": "12. Geografía Mundial",
    "q": "La capital de Brasil es:",
    "visual": null,
    "opts": ["Río","São Paulo","Brasilia"],
    "ans": 2,
    "expl": "Diseñada por Niemeyer.",
    "context": null
},
{
    "id": 506,
    "section": "12. Geografía Mundial",
    "q": "El país más pequeño del mundo es:",
    "visual": null,
    "opts": ["Mónaco","Vaticano","San Marino"],
    "ans": 1,
    "expl": "0.44 km².",
    "context": null
},
{
    "id": 507,
    "section": "12. Geografía Mundial",
    "q": "El Mar Muerto está entre:",
    "visual": null,
    "opts": ["Israel/Jordania","Turquía/Grecia","Egipto/Libia"],
    "ans": 0,
    "expl": "430 m bajo el nivel del mar.",
    "context": null
},
{
    "id": 508,
    "section": "12. Geografía Mundial",
    "q": "La Antártida es:",
    "visual": null,
    "opts": ["País","Continente","Isla"],
    "ans": 1,
    "expl": "El más frío.",
    "context": null
},
{
    "id": 509,
    "section": "12. Geografía Mundial",
    "q": "El canal de Panamá une:",
    "visual": null,
    "opts": ["Atlántico/Pacífico","Índico/Atlántico","Pacífico/Ártico"],
    "ans": 0,
    "expl": "Inaugurado en 1914.",
    "context": null
},
{
    "id": 510,
    "section": "12. Geografía Mundial",
    "q": "Groenlandia pertenece a:",
    "visual": null,
    "opts": ["Canadá","Dinamarca","Noruega"],
    "ans": 1,
    "expl": "Territorio autónomo danés.",
    "context": null
},
{
    "id": 511,
    "section": "12. Geografía Mundial",
    "q": "La capital de Egipto es:",
    "visual": null,
    "opts": ["Alejandría","El Cairo","Luxor"],
    "ans": 1,
    "expl": "La ciudad más poblada de África.",
    "context": null
},
{
    "id": 512,
    "section": "12. Geografía Mundial",
    "q": "El río Danubio pasa por:",
    "visual": null,
    "opts": ["3 países","6 países","10 países"],
    "ans": 2,
    "expl": "Segundo río más largo de Europa.",
    "context": null
},
{
    "id": 513,
    "section": "12. Geografía Mundial",
    "q": "El continente con más países es:",
    "visual": null,
    "opts": ["Asia","África","Europa"],
    "ans": 1,
    "expl": "54 países reconocidos.",
    "context": null
},
{
    "id": 514,
    "section": "13. Arte y Literatura",
    "q": "Don Quijote fue escrito por:",
    "visual": null,
    "opts": ["Lope de Vega","Cervantes","Quevedo"],
    "ans": 1,
    "expl": "Miguel de Cervantes (1605).",
    "context": null
},
{
    "id": 515,
    "section": "13. Arte y Literatura",
    "q": "Cien años de soledad es de:",
    "visual": null,
    "opts": ["García Márquez","Vargas Llosa","Cortázar"],
    "ans": 0,
    "expl": "Gabriel García Márquez.",
    "context": null
},
{
    "id": 516,
    "section": "13. Arte y Literatura",
    "q": "Romeo y Julieta es de:",
    "visual": null,
    "opts": ["Dickens","Shakespeare","Austen"],
    "ans": 1,
    "expl": "William Shakespeare.",
    "context": null
},
{
    "id": 517,
    "section": "13. Arte y Literatura",
    "q": "La Odisea fue escrita por:",
    "visual": null,
    "opts": ["Sófocles","Homero","Virgilio"],
    "ans": 1,
    "expl": "Grecia antigua.",
    "context": null
},
{
    "id": 518,
    "section": "13. Arte y Literatura",
    "q": "El primer libro de Harry Potter es:",
    "visual": null,
    "opts": ["Cámara Secreta","Piedra Filosofal","Prisionero"],
    "ans": 1,
    "expl": "1997.",
    "context": null
},
{
    "id": 519,
    "section": "13. Arte y Literatura",
    "q": "El Principito es de:",
    "visual": null,
    "opts": ["Hugo","Saint-Exupéry","Verne"],
    "ans": 1,
    "expl": "Antoine de Saint-Exupéry.",
    "context": null
},
{
    "id": 520,
    "section": "13. Arte y Literatura",
    "q": "Crimen y castigo es de:",
    "visual": null,
    "opts": ["Tolstói","Dostoyevski","Chéjov"],
    "ans": 1,
    "expl": "Fiódor Dostoyevski.",
    "context": null
},
{
    "id": 521,
    "section": "13. Arte y Literatura",
    "q": "Rayuela es de:",
    "visual": null,
    "opts": ["Cortázar","García Márquez","Neruda"],
    "ans": 0,
    "expl": "Julio Cortázar (1963).",
    "context": null
},
{
    "id": 522,
    "section": "13. Arte y Literatura",
    "q": "Orgullo y prejuicio es de:",
    "visual": null,
    "opts": ["Charlotte Brontë","Jane Austen","Shelley"],
    "ans": 1,
    "expl": "Jane Austen (1813).",
    "context": null
},
{
    "id": 523,
    "section": "13. Arte y Literatura",
    "q": "La Divina Comedia es de:",
    "visual": null,
    "opts": ["Petrarca","Dante","Boccaccio"],
    "ans": 1,
    "expl": "Dante Alighieri.",
    "context": null
},
{
    "id": 524,
    "section": "13. Arte y Literatura",
    "q": "La noche estrellada es de:",
    "visual": null,
    "opts": ["Monet","Van Gogh","Cézanne"],
    "ans": 1,
    "expl": "Vincent van Gogh (1889).",
    "context": null
},
{
    "id": 525,
    "section": "13. Arte y Literatura",
    "q": "El tango se originó en:",
    "visual": null,
    "opts": ["Brasil","Argentina","Chile"],
    "ans": 1,
    "expl": "Río de la Plata.",
    "context": null
},
{
    "id": 526,
    "section": "13. Arte y Literatura",
    "q": "El David fue esculpido por:",
    "visual": null,
    "opts": ["Leonardo","Miguel Ángel","Rafael"],
    "ans": 1,
    "expl": "Miguel Ángel (1504).",
    "context": null
},
{
    "id": 527,
    "section": "13. Arte y Literatura",
    "q": "Dalí representa al:",
    "visual": null,
    "opts": ["Impresionismo","Surrealismo","Cubismo"],
    "ans": 1,
    "expl": "Surrealismo español.",
    "context": null
},
{
    "id": 528,
    "section": "13. Arte y Literatura",
    "q": "El Louvre está en:",
    "visual": null,
    "opts": ["Italia","Francia","España"],
    "ans": 1,
    "expl": "París.",
    "context": null
},
{
    "id": 529,
    "section": "13. Arte y Literatura",
    "q": "El Guernica es de:",
    "visual": null,
    "opts": ["Dalí","Miró","Picasso"],
    "ans": 2,
    "expl": "Pablo Picasso (1937).",
    "context": null
},
{
    "id": 530,
    "section": "13. Arte y Literatura",
    "q": "El piano tiene:",
    "visual": null,
    "opts": ["72 teclas","88 teclas","100 teclas"],
    "ans": 1,
    "expl": "Estándar moderno.",
    "context": null
},
{
    "id": 531,
    "section": "13. Arte y Literatura",
    "q": "El flamenco es de:",
    "visual": null,
    "opts": ["Italia","España","Portugal"],
    "ans": 1,
    "expl": "Andalucía.",
    "context": null
},
{
    "id": 532,
    "section": "13. Arte y Literatura",
    "q": "La Novena Sinfonía es de:",
    "visual": null,
    "opts": ["Mozart","Beethoven","Bach"],
    "ans": 1,
    "expl": "Ludwig van Beethoven.",
    "context": null
},
{
    "id": 533,
    "section": "13. Arte y Literatura",
    "q": "Las latas Campbell son de:",
    "visual": null,
    "opts": ["Lichtenstein","Warhol","Haring"],
    "ans": 1,
    "expl": "Andy Warhol, pop art.",
    "context": null
},
{
    "id": 534,
    "section": "13. Arte y Literatura",
    "q": "La Capilla Sixtina está en:",
    "visual": null,
    "opts": ["Roma","Florencia","Vaticano"],
    "ans": 2,
    "expl": "Ciudad del Vaticano.",
    "context": null
},
{
    "id": 535,
    "section": "13. Arte y Literatura",
    "q": "El estilo gótico se caracteriza por:",
    "visual": null,
    "opts": ["Arcos de medio punto","Arcos apuntados","Cúpulas"],
    "ans": 1,
    "expl": "Catedrales medievales.",
    "context": null
},
{
    "id": 536,
    "section": "13. Arte y Literatura",
    "q": "La Mona Lisa fue pintada por:",
    "visual": null,
    "opts": ["Miguel Ángel","Leonardo","Botticelli"],
    "ans": 1,
    "expl": "Leonardo da Vinci.",
    "context": null
},
{
    "id": 537,
    "section": "13. Arte y Literatura",
    "q": "El Nobel de Literatura 2023 fue para:",
    "visual": null,
    "opts": ["Rushdie","Jon Fosse","Gurnah"],
    "ans": 1,
    "expl": "Dramaturgo noruego.",
    "context": null
},
{
    "id": 538,
    "section": "13. Arte y Literatura",
    "q": "Pablo Neruda era:",
    "visual": null,
    "opts": ["Mexicano","Chileno","Colombiano"],
    "ans": 1,
    "expl": "Nobel de Literatura 1971.",
    "context": null
},
{
    "id": 539,
    "section": "14. Deportes",
    "q": "Un equipo de fútbol tiene:",
    "visual": null,
    "opts": ["9","11","12"],
    "ans": 1,
    "expl": "Jugadores en cancha.",
    "context": null
},
{
    "id": 540,
    "section": "14. Deportes",
    "q": "El campeón del Mundial 2022 fue:",
    "visual": null,
    "opts": ["Francia","Brasil","Argentina"],
    "ans": 2,
    "expl": "Argentina con Messi.",
    "context": null
},
{
    "id": 541,
    "section": "14. Deportes",
    "q": "El símbolo olímpico tiene:",
    "visual": null,
    "opts": ["4 anillos","5 anillos","6 anillos"],
    "ans": 1,
    "expl": "Cinco continentes.",
    "context": null
},
{
    "id": 542,
    "section": "14. Deportes",
    "q": "Michael Phelps es de:",
    "visual": null,
    "opts": ["Atletismo","Natación","Ciclismo"],
    "ans": 1,
    "expl": "Nadador olímpico.",
    "context": null
},
{
    "id": 543,
    "section": "14. Deportes",
    "q": "Un partido de fútbol dura:",
    "visual": null,
    "opts": ["60 min","90 min","120 min"],
    "ans": 1,
    "expl": "2 tiempos de 45.",
    "context": null
},
{
    "id": 544,
    "section": "14. Deportes",
    "q": "El judo se originó en:",
    "visual": null,
    "opts": ["China","Corea","Japón"],
    "ans": 2,
    "expl": "Japón, siglo XIX.",
    "context": null
},
{
    "id": 545,
    "section": "14. Deportes",
    "q": "Hole in one es del:",
    "visual": null,
    "opts": ["Béisbol","Golf","Cricket"],
    "ans": 1,
    "expl": "Golf.",
    "context": null
},
{
    "id": 546,
    "section": "14. Deportes",
    "q": "Un touchdown vale:",
    "visual": null,
    "opts": ["3","6","7"],
    "ans": 1,
    "expl": "Fútbol americano.",
    "context": null
},
{
    "id": 547,
    "section": "14. Deportes",
    "q": "El tenista con más Roland Garros es:",
    "visual": null,
    "opts": ["Alcaraz","Nadal","Federer"],
    "ans": 1,
    "expl": "Rafael Nadal (14).",
    "context": null
},
{
    "id": 548,
    "section": "14. Deportes",
    "q": "Los JJOO modernos iniciaron en:",
    "visual": null,
    "opts": ["1892","1896","1900"],
    "ans": 1,
    "expl": "Atenas 1896.",
    "context": null
},
{
    "id": 549,
    "section": "14. Deportes",
    "q": "El baloncesto se inventó en:",
    "visual": null,
    "opts": ["1891","1901","1911"],
    "ans": 0,
    "expl": "James Naismith.",
    "context": null
},
{
    "id": 550,
    "section": "14. Deportes",
    "q": "Usain Bolt es de:",
    "visual": null,
    "opts": ["Jamaica","EE.UU.","Nigeria"],
    "ans": 0,
    "expl": "Velocista jamaiquino.",
    "context": null
},
{
    "id": 551,
    "section": "14. Deportes",
    "q": "El Maracanazo fue en:",
    "visual": null,
    "opts": ["1946","1950","1954"],
    "ans": 1,
    "expl": "Uruguay ganó en Brasil.",
    "context": null
},
{
    "id": 552,
    "section": "14. Deportes",
    "q": "El Tour de Francia es:",
    "visual": null,
    "opts": ["Fútbol","Ciclismo","Motociclismo"],
    "ans": 1,
    "expl": "Carrera ciclista.",
    "context": null
},
{
    "id": 553,
    "section": "14. Deportes",
    "q": "La NBA es liga de:",
    "visual": null,
    "opts": ["Béisbol","Baloncesto","Hockey"],
    "ans": 1,
    "expl": "Baloncesto en EE.UU.",
    "context": null
},
{
    "id": 554,
    "section": "14. Deportes",
    "q": "El Super Bowl es de:",
    "visual": null,
    "opts": ["Fútbol americano","Béisbol","Rugby"],
    "ans": 0,
    "expl": "Final de la NFL.",
    "context": null
},
{
    "id": 555,
    "section": "14. Deportes",
    "q": "El críquet es popular en:",
    "visual": null,
    "opts": ["India","Brasil","Canadá"],
    "ans": 0,
    "expl": "India, Inglaterra, Australia.",
    "context": null
},
{
    "id": 556,
    "section": "14. Deportes",
    "q": "El sumo es de:",
    "visual": null,
    "opts": ["China","Japón","Corea"],
    "ans": 1,
    "expl": "Deporte nacional japonés.",
    "context": null
},
{
    "id": 557,
    "section": "14. Deportes",
    "q": "Un set de tenis normalmente va a:",
    "visual": null,
    "opts": ["4 juegos","6 juegos","8 juegos"],
    "ans": 1,
    "expl": "Con 2 de ventaja.",
    "context": null
},
{
    "id": 558,
    "section": "14. Deportes",
    "q": "La Fórmula 1 usa:",
    "visual": null,
    "opts": ["Monoplazas","Sedanes","Camiones"],
    "ans": 0,
    "expl": "Coches de carreras.",
    "context": null
},
{
    "id": 559,
    "section": "14. Deportes",
    "q": "Los Juegos Olímpicos son cada:",
    "visual": null,
    "opts": ["2 años","4 años","5 años"],
    "ans": 1,
    "expl": "Cuatro años.",
    "context": null
},
{
    "id": 560,
    "section": "14. Deportes",
    "q": "La Copa Davis es de:",
    "visual": null,
    "opts": ["Fútbol","Tenis","Golf"],
    "ans": 1,
    "expl": "Tenis masculino por equipos.",
    "context": null
},
{
    "id": 561,
    "section": "14. Deportes",
    "q": "El golf usa:",
    "visual": null,
    "opts": ["Palos y pelotas","Raquetas","Bates"],
    "ans": 0,
    "expl": "Palos y pelota pequeña.",
    "context": null
},
{
    "id": 562,
    "section": "14. Deportes",
    "q": "El volante se usa en:",
    "visual": null,
    "opts": ["Tenis","Bádminton","Squash"],
    "ans": 1,
    "expl": "Shuttlecock.",
    "context": null
},
{
    "id": 563,
    "section": "14. Deportes",
    "q": "El Mundial 2026 será en:",
    "visual": null,
    "opts": ["Qatar","EE.UU./Canadá/México","Brasil"],
    "ans": 1,
    "expl": "Tres países anfitriones.",
    "context": null
},
{
    "id": 564,
    "section": "15. Actualidad 2024-2026",
    "q": "Los JJOO 2024 fueron en:",
    "visual": null,
    "opts": ["Tokio","París","LA"],
    "ans": 1,
    "expl": "París 2024.",
    "context": null
},
{
    "id": 565,
    "section": "15. Actualidad 2024-2026",
    "q": "La IA generativa impacta en:",
    "visual": null,
    "opts": ["Solo tech","Múltiples sectores","Solo videojuegos"],
    "ans": 1,
    "expl": "Transversal.",
    "context": null
},
{
    "id": 566,
    "section": "15. Actualidad 2024-2026",
    "q": "ChatGPT fue lanzado en:",
    "visual": null,
    "opts": ["2020","2022","2024"],
    "ans": 1,
    "expl": "Noviembre 2022.",
    "context": null
},
{
    "id": 567,
    "section": "15. Actualidad 2024-2026",
    "q": "La guerra Ucrania-Rusia comenzó en:",
    "visual": null,
    "opts": ["2020","2022","2024"],
    "ans": 1,
    "expl": "Febrero 2022.",
    "context": null
},
{
    "id": 568,
    "section": "15. Actualidad 2024-2026",
    "q": "El telescopio James Webb es:",
    "visual": null,
    "opts": ["Terrestre","Espacial","Submarino"],
    "ans": 1,
    "expl": "Sucesor del Hubble.",
    "context": null
},
{
    "id": 569,
    "section": "15. Actualidad 2024-2026",
    "q": "La misión Artemis busca volver a:",
    "visual": null,
    "opts": ["Marte","La Luna","Venus"],
    "ans": 1,
    "expl": "Programa NASA.",
    "context": null
},
{
    "id": 570,
    "section": "15. Actualidad 2024-2026",
    "q": "La pandemia COVID-19 comenzó en:",
    "visual": null,
    "opts": ["2018","2019","2020"],
    "ans": 1,
    "expl": "Diciembre 2019 en Wuhan.",
    "context": null
},
{
    "id": 571,
    "section": "15. Actualidad 2024-2026",
    "q": "El primer presidente mujer de México fue electa en:",
    "visual": null,
    "opts": ["2020","2024","2026"],
    "ans": 1,
    "expl": "Claudia Sheinbaum.",
    "context": null
},
{
    "id": 572,
    "section": "15. Actualidad 2024-2026",
    "q": "SpaceX lanzó Starship en:",
    "visual": null,
    "opts": ["2022","2023","2024"],
    "ans": 1,
    "expl": "Pruebas orbitales en 2023.",
    "context": null
},
{
    "id": 573,
    "section": "15. Actualidad 2024-2026",
    "q": "La Unión Europea tiene actualmente:",
    "visual": null,
    "opts": ["25 países","27 países","30 países"],
    "ans": 1,
    "expl": "Tras el Brexit.",
    "context": null
},
{
    "id": 574,
    "section": "15. Actualidad 2024-2026",
    "q": "La crisis climática causa:",
    "visual": null,
    "opts": ["Solo frío","Eventos extremos","Nada"],
    "ans": 1,
    "expl": "Olas de calor, inundaciones.",
    "context": null
},
{
    "id": 575,
    "section": "15. Actualidad 2024-2026",
    "q": "El coche eléctrico más vendido en 2024 fue de:",
    "visual": null,
    "opts": ["Ford","Tesla","Toyota"],
    "ans": 1,
    "expl": "Tesla Model Y.",
    "context": null
},
{
    "id": 576,
    "section": "15. Actualidad 2024-2026",
    "q": "La ONU fue fundada en:",
    "visual": null,
    "opts": ["1935","1945","1955"],
    "ans": 1,
    "expl": "Tras la WWII.",
    "context": null
},
{
    "id": 577,
    "section": "15. Actualidad 2024-2026",
    "q": "Un año bisiesto tiene:",
    "visual": null,
    "opts": ["364","365","366"],
    "ans": 2,
    "expl": "Día extra en febrero.",
    "context": null
},
{
    "id": 578,
    "section": "15. Actualidad 2024-2026",
    "q": "El órgano que más energía consume es:",
    "visual": null,
    "opts": ["Corazón","Cerebro","Hígado"],
    "ans": 1,
    "expl": "20% del consumo total.",
    "context": null
},
{
    "id": 579,
    "section": "15. Actualidad 2024-2026",
    "q": "El día más largo (hemisferio norte) es:",
    "visual": null,
    "opts": ["Equinoccio primavera","Solsticio verano","Invierno"],
    "ans": 1,
    "expl": "21 de junio aprox.",
    "context": null
},
{
    "id": 580,
    "section": "15. Actualidad 2024-2026",
    "q": "La mezcla de azul y amarillo da:",
    "visual": null,
    "opts": ["Naranja","Verde","Morado"],
    "ans": 1,
    "expl": "Colores primarios.",
    "context": null
},
{
    "id": 581,
    "section": "15. Actualidad 2024-2026",
    "q": "La moneda de la Unión Europea es:",
    "visual": null,
    "opts": ["Libra","Euro","Franco"],
    "ans": 1,
    "expl": "Desde 2002.",
    "context": null
},
{
    "id": 582,
    "section": "15. Actualidad 2024-2026",
    "q": "El G7 reúne a las:",
    "visual": null,
    "opts": ["7 economías más grandes","7 países más poblados","7 naciones más antiguas"],
    "ans": 0,
    "expl": "Grupo de los 7.",
    "context": null
},
{
    "id": 583,
    "section": "15. Actualidad 2024-2026",
    "q": "La OMS se encarga de:",
    "visual": null,
    "opts": ["Comercio","Salud pública mundial","Educación"],
    "ans": 1,
    "expl": "Organización Mundial de la Salud.",
    "context": null
},
{
    "id": 584,
    "section": "16. Razonamiento Lógico",
    "q": "Continúa la secuencia: 2, 4, 8, 16, ...",
    "visual": null,
    "opts": ["24","32","64"],
    "ans": 1,
    "expl": "Se duplica (×2).",
    "context": null
},
{
    "id": 585,
    "section": "16. Razonamiento Lógico",
    "q": "Si todos los A son B, y algunos B son C, entonces:",
    "visual": null,
    "opts": ["Todos A son C","Algunos A pueden ser C","Ningún A es C"],
    "ans": 1,
    "expl": "Silogismo: posibilidad, no certeza.",
    "context": null
},
{
    "id": 586,
    "section": "16. Razonamiento Lógico",
    "q": "Si María es más alta que Juan, y Juan más que Pedro, entonces:",
    "visual": null,
    "opts": ["María > Pedro","Pedro > María","Iguales"],
    "ans": 0,
    "expl": "Transitividad.",
    "context": null
},
{
    "id": 587,
    "section": "16. Razonamiento Lógico",
    "q": "Continúa: 1, 1, 2, 3, 5, 8, ...",
    "visual": null,
    "opts": ["10","11","13"],
    "ans": 2,
    "expl": "Fibonacci (suma de los dos anteriores).",
    "context": null
},
{
    "id": 588,
    "section": "16. Razonamiento Lógico",
    "q": "Si hoy es martes, ¿qué día será dentro de 100 días?",
    "visual": null,
    "opts": ["Miércoles","Jueves","Viernes"],
    "ans": 1,
    "expl": "100 mod 7 = 2. Martes + 2 = Jueves.",
    "context": null
},
{
    "id": 589,
    "section": "16. Razonamiento Lógico",
    "q": "Completa: A, C, E, G, ...",
    "visual": null,
    "opts": ["H","I","J"],
    "ans": 1,
    "expl": "Salta 1 letra.",
    "context": null
},
{
    "id": 590,
    "section": "16. Razonamiento Lógico",
    "q": "El opuesto de 'siempre' es:",
    "visual": null,
    "opts": ["A veces","Nunca","Rara vez"],
    "ans": 1,
    "expl": "Negación absoluta.",
    "context": null
},
{
    "id": 591,
    "section": "16. Razonamiento Lógico",
    "q": "Si P → Q es verdadero y P es verdadero, entonces:",
    "visual": null,
    "opts": ["Q es verdadero","Q es falso","No se sabe"],
    "ans": 0,
    "expl": "Modus ponens.",
    "context": null
},
{
    "id": 592,
    "section": "16. Razonamiento Lógico",
    "q": "Continúa: 3, 6, 12, 24, ...",
    "visual": null,
    "opts": ["36","48","60"],
    "ans": 1,
    "expl": "Se duplica (×2).",
    "context": null
},
{
    "id": 593,
    "section": "16. Razonamiento Lógico",
    "q": "Si ningún A es B, y todos los C son A, entonces:",
    "visual": null,
    "opts": ["Ningún C es B","Algunos C son B","Todos C son B"],
    "ans": 0,
    "expl": "Transitividad de la negación.",
    "context": null
},
{
    "id": 594,
    "section": "16. Razonamiento Lógico",
    "q": "¿Cuál número no sigue el patrón: 2, 4, 8, 15, 32?",
    "visual": null,
    "opts": ["2","15","32"],
    "ans": 1,
    "expl": "Debería ser 16 (×2).",
    "context": null
},
{
    "id": 595,
    "section": "16. Razonamiento Lógico",
    "q": "La secuencia 1, 4, 9, 16, 25 son:",
    "visual": null,
    "opts": ["Primos","Cuadrados perfectos","Pares"],
    "ans": 1,
    "expl": "1², 2², 3², 4², 5².",
    "context": null
},
{
    "id": 596,
    "section": "16. Razonamiento Lógico",
    "q": "Si el abuelo de Pedro es el padre de mi padre, yo soy:",
    "visual": null,
    "opts": ["Hijo de Pedro","Primo de Pedro","Tío de Pedro"],
    "ans": 2,
    "expl": "Hermano del padre de Pedro.",
    "context": null
},
{
    "id": 597,
    "section": "16. Razonamiento Lógico",
    "q": "Completa: 100, 81, 64, 49, ...",
    "visual": null,
    "opts": ["25","36","40"],
    "ans": 1,
    "expl": "Cuadrados descendentes: 6² = 36.",
    "context": null
},
{
    "id": 598,
    "section": "16. Razonamiento Lógico",
    "q": "Si Juan dice 'estoy mintiendo', entonces:",
    "visual": null,
    "opts": ["Dice verdad","Miente","Paradoja"],
    "ans": 2,
    "expl": "Paradoja del mentiroso.",
    "context": null
},
{
    "id": 599,
    "section": "16. Razonamiento Lógico",
    "q": "Continúa: Z, X, V, T, ...",
    "visual": null,
    "opts": ["Q","R","S"],
    "ans": 1,
    "expl": "Salta 1 letra hacia atrás.",
    "context": null
},
{
    "id": 600,
    "section": "16. Razonamiento Lógico",
    "q": "Si 5 > 3 y 3 > 1, entonces:",
    "visual": null,
    "opts": ["5 > 1","1 > 5","Iguales"],
    "ans": 0,
    "expl": "Transitividad.",
    "context": null
},
{
    "id": 601,
    "section": "16. Razonamiento Lógico",
    "q": "El siguiente número en 2, 3, 5, 7, 11 es:",
    "visual": null,
    "opts": ["12","13","15"],
    "ans": 1,
    "expl": "Números primos.",
    "context": null
},
{
    "id": 602,
    "section": "16. Razonamiento Lógico",
    "q": "Si todas las rosas son flores y todas las flores necesitan agua, entonces:",
    "visual": null,
    "opts": ["Todas las rosas necesitan agua","Algunas rosas no necesitan agua","Las flores son rosas"],
    "ans": 0,
    "expl": "Silogismo categórico válido.",
    "context": null
},
{
    "id": 603,
    "section": "16. Razonamiento Lógico",
    "q": "¿Cuál es la letra que falta? B, D, F, H, _",
    "visual": null,
    "opts": ["I","J","K"],
    "ans": 1,
    "expl": "Salto de 2: B(2), D(4), F(6), H(8), J(10).",
    "context": null
},
{
    "id": 604,
    "section": "16. Razonamiento Lógico",
    "q": "Si tengo 3 camisas y 4 pantalones, ¿cuántas combinaciones puedo hacer?",
    "visual": null,
    "opts": ["7","12","24"],
    "ans": 1,
    "expl": "3 × 4 = 12 combinaciones.",
    "context": null
},
{
    "id": 605,
    "section": "16. Razonamiento Lógico",
    "q": "Si A = 1, B = 2, C = 3... ¿cuánto vale F + G?",
    "visual": null,
    "opts": ["11","13","15"],
    "ans": 1,
    "expl": "F=6, G=7. 6+7 = 13.",
    "context": null
},
{
    "id": 606,
    "section": "16. Razonamiento Lógico",
    "q": "Si llueve → hay nubes. No hay nubes, entonces:",
    "visual": null,
    "opts": ["Llueve","No llueve","No se sabe"],
    "ans": 1,
    "expl": "Modus tollens.",
    "context": null
},
{
    "id": 607,
    "section": "16. Razonamiento Lógico",
    "q": "3 gatos comen 3 ratones en 3 minutos. ¿Cuántos gatos comen 100 ratones en 100 minutos?",
    "visual": null,
    "opts": ["100","3","33"],
    "ans": 1,
    "expl": "Cada gato come 1 ratón en 3 minutos. En 100 min, 3 gatos comen 100.",
    "context": null
},
{
    "id": 608,
    "section": "16. Razonamiento Lógico",
    "q": "Si tengo un cubo de 3×3×3, ¿cuántos cubitos tiene?",
    "visual": null,
    "opts": ["9","18","27"],
    "ans": 2,
    "expl": "3³ = 27.",
    "context": null
},
{
    "id": 609,
    "section": "16. Razonamiento Lógico",
    "q": "Si el reloj muestra las 3:00 en un espejo, ¿qué hora es realmente?",
    "visual": null,
    "opts": ["9:00","3:00","6:00"],
    "ans": 0,
    "expl": "Reflejo horizontal: 3 → 9.",
    "context": null
},
{
    "id": 610,
    "section": "16. Razonamiento Lógico",
    "q": "La secuencia 0, 1, 3, 6, 10, 15... son:",
    "visual": null,
    "opts": ["Fibonacci","Triangulares","Cúbicos"],
    "ans": 1,
    "expl": "Números triangulares: +1, +2, +3, +4, +5.",
    "context": null
},
{
    "id": 611,
    "section": "16. Razonamiento Lógico",
    "q": "Si A es hermana de B, y B es padre de C, ¿qué es A de C?",
    "visual": null,
    "opts": ["Madre","Tía","Abuela"],
    "ans": 1,
    "expl": "A es hermana del padre de C = tía.",
    "context": null
},
{
    "id": 612,
    "section": "16. Razonamiento Lógico",
    "q": "En una fila de 20 personas, Juan está en el lugar 8. ¿Cuántas personas hay detrás de él?",
    "visual": null,
    "opts": ["11","12","13"],
    "ans": 1,
    "expl": "20 - 8 = 12 personas detrás.",
    "context": null
},
{
    "id": 613,
    "section": "16. Razonamiento Lógico",
    "q": "Si 2 pintores pintan 2 paredes en 2 horas, ¿cuántos pintores pintan 8 paredes en 4 horas?",
    "visual": null,
    "opts": ["2","4","8"],
    "ans": 1,
    "expl": "1 pintor = 1 pared/2h. En 4h pinta 2 paredes. Para 8 paredes: 4 pintores.",
    "context": null
},
{
    "id": 614,
    "section": "17. Comprensión Verbal",
    "q": "Sinónimo de 'perspicaz':",
    "visual": null,
    "opts": ["Torpe","Astuto","Lento"],
    "ans": 1,
    "expl": "Perspicaz = agudo, sagaz.",
    "context": null
},
{
    "id": 615,
    "section": "17. Comprensión Verbal",
    "q": "Antónimo de 'opulento':",
    "visual": null,
    "opts": ["Rico","Miserable","Generoso"],
    "ans": 1,
    "expl": "Opulento = rico. Antónimo = miserable.",
    "context": null
},
{
    "id": 616,
    "section": "17. Comprensión Verbal",
    "q": "Sinónimo de 'efímero':",
    "visual": null,
    "opts": ["Eterno","Pasajero","Sólido"],
    "ans": 1,
    "expl": "De corta duración.",
    "context": null
},
{
    "id": 617,
    "section": "17. Comprensión Verbal",
    "q": "Antónimo de 'prolijo':",
    "visual": null,
    "opts": ["Descuidado","Ordenado","Puntual"],
    "ans": 0,
    "expl": "Prolijo = cuidadoso. Antónimo = descuidado.",
    "context": null
},
{
    "id": 618,
    "section": "17. Comprensión Verbal",
    "q": "Analogía: Pincel es a pintor como bisturí es a:",
    "visual": null,
    "opts": ["Mecánico","Cirujano","Carpintero"],
    "ans": 1,
    "expl": "Herramienta profesional.",
    "context": null
},
{
    "id": 619,
    "section": "17. Comprensión Verbal",
    "q": "Analogía: Semilla es a árbol como huevo es a:",
    "visual": null,
    "opts": ["Nido","Ave","Cáscara"],
    "ans": 1,
    "expl": "Origen y resultado.",
    "context": null
},
{
    "id": 620,
    "section": "17. Comprensión Verbal",
    "q": "Sinónimo de 'vehemente':",
    "visual": null,
    "opts": ["Apático","Apasionado","Tranquilo"],
    "ans": 1,
    "expl": "Con fuerza y pasión.",
    "context": null
},
{
    "id": 621,
    "section": "17. Comprensión Verbal",
    "q": "Antónimo de 'ubicuo':",
    "visual": null,
    "opts": ["Presente en todas partes","Ausente","Cercano"],
    "ans": 1,
    "expl": "Ubicuo = en todas partes. Antónimo = ausente.",
    "context": null
},
{
    "id": 622,
    "section": "17. Comprensión Verbal",
    "q": "Analogía: Mapa es a territorio como plano es a:",
    "visual": null,
    "opts": ["Edificio","Papel","Ingeniero"],
    "ans": 0,
    "expl": "Representación de lo real.",
    "context": null
},
{
    "id": 623,
    "section": "17. Comprensión Verbal",
    "q": "Sinónimo de 'lacónico':",
    "visual": null,
    "opts": ["Extenso","Breve","Confuso"],
    "ans": 1,
    "expl": "De pocas palabras.",
    "context": null
},
{
    "id": 624,
    "section": "17. Comprensión Verbal",
    "q": "Antónimo de 'altruista':",
    "visual": null,
    "opts": ["Generoso","Egoísta","Noble"],
    "ans": 1,
    "expl": "Altruista = desinteresado. Opuesto = egoísta.",
    "context": null
},
{
    "id": 625,
    "section": "17. Comprensión Verbal",
    "q": "Analogía: Agua es a sed como comida es a:",
    "visual": null,
    "opts": ["Hambre","Gusto","Cocina"],
    "ans": 0,
    "expl": "Satisface una necesidad.",
    "context": null
},
{
    "id": 626,
    "section": "17. Comprensión Verbal",
    "q": "Sinónimo de 'pragmático':",
    "visual": null,
    "opts": ["Teórico","Práctico","Abstracto"],
    "ans": 1,
    "expl": "Orientado a la práctica.",
    "context": null
},
{
    "id": 627,
    "section": "17. Comprensión Verbal",
    "q": "Palabra que NO pertenece al grupo: {cuchillo, tenedor, cuchara, servilleta}:",
    "visual": null,
    "opts": ["Cuchillo","Cuchara","Servilleta"],
    "ans": 2,
    "expl": "Servilleta no es un cubierto.",
    "context": null
},
{
    "id": 628,
    "section": "17. Comprensión Verbal",
    "q": "Analogía: Dedo es a mano como diente es a:",
    "visual": null,
    "opts": ["Lengua","Boca","Labio"],
    "ans": 1,
    "expl": "Parte del todo.",
    "context": null
},
{
    "id": 629,
    "section": "17. Comprensión Verbal",
    "q": "Sinónimo de 'audaz':",
    "visual": null,
    "opts": ["Cobarde","Valiente","Tímido"],
    "ans": 1,
    "expl": "Atrevido, intrépido.",
    "context": null
},
{
    "id": 630,
    "section": "17. Comprensión Verbal",
    "q": "Antónimo de 'prolífico':",
    "visual": null,
    "opts": ["Productivo","Estéril","Creativo"],
    "ans": 1,
    "expl": "Prolífico = abundante. Antónimo = estéril.",
    "context": null
},
{
    "id": 631,
    "section": "17. Comprensión Verbal",
    "q": "Analogía: Brújula es a dirección como reloj es a:",
    "visual": null,
    "opts": ["Tiempo","Aguja","Cristal"],
    "ans": 0,
    "expl": "Instrumento de medición.",
    "context": null
},
{
    "id": 632,
    "section": "17. Comprensión Verbal",
    "q": "Palabra que NO pertenece: {oro, plata, cobre, diamante}:",
    "visual": null,
    "opts": ["Oro","Cobre","Diamante"],
    "ans": 2,
    "expl": "Diamante no es un metal.",
    "context": null
},
{
    "id": 633,
    "section": "17. Comprensión Verbal",
    "q": "Sinónimo de 'reticente':",
    "visual": null,
    "opts": ["Entusiasta","Reservado","Abierto"],
    "ans": 1,
    "expl": "Que no se muestra dispuesto.",
    "context": null
},
{
    "id": 634,
    "section": "17. Comprensión Verbal",
    "q": "Antónimo de 'euforia':",
    "visual": null,
    "opts": ["Alegría","Tristeza","Energía"],
    "ans": 1,
    "expl": "Estado de ánimo opuesto.",
    "context": null
},
{
    "id": 635,
    "section": "17. Comprensión Verbal",
    "q": "Analogía: Profesor es a escuela como médico es a:",
    "visual": null,
    "opts": ["Paciente","Hospital","Medicina"],
    "ans": 1,
    "expl": "Profesional y lugar de trabajo.",
    "context": null
},
{
    "id": 636,
    "section": "17. Comprensión Verbal",
    "q": "Sinónimo de 'obsoleto':",
    "visual": null,
    "opts": ["Moderno","Anticuado","Nuevo"],
    "ans": 1,
    "expl": "Ya no se usa.",
    "context": null
},
{
    "id": 637,
    "section": "17. Comprensión Verbal",
    "q": "Palabra que NO pertenece: {Excel, Word, PowerPoint, Windows}:",
    "visual": null,
    "opts": ["Excel","PowerPoint","Windows"],
    "ans": 2,
    "expl": "Windows es un SO, los demás son aplicaciones de Office.",
    "context": null
},
{
    "id": 638,
    "section": "17. Comprensión Verbal",
    "q": "Analogía: Abogado es a ley como arquitecto es a:",
    "visual": null,
    "opts": ["Casa","Diseño","Edificio"],
    "ans": 1,
    "expl": "Campo de especialización.",
    "context": null
},
{
    "id": 639,
    "section": "17. Comprensión Verbal",
    "q": "Sinónimo de 'diligente':",
    "visual": null,
    "opts": ["Perezoso","Trabajador","Lento"],
    "ans": 1,
    "expl": "Cuidadoso y rápido en su labor.",
    "context": null
},
{
    "id": 640,
    "section": "17. Comprensión Verbal",
    "q": "Antónimo de 'ambiguo':",
    "visual": null,
    "opts": ["Claro","Confuso","Oscuro"],
    "ans": 0,
    "expl": "Ambiguo = con doble sentido. Claro = preciso.",
    "context": null
},
{
    "id": 641,
    "section": "17. Comprensión Verbal",
    "q": "Palabra que NO pertenece: {México, Chile, España, Colombia}:",
    "visual": null,
    "opts": ["Chile","España","Colombia"],
    "ans": 1,
    "expl": "España no está en América.",
    "context": null
},
{
    "id": 642,
    "section": "17. Comprensión Verbal",
    "q": "Analogía: Luna es a noche como sol es a:",
    "visual": null,
    "opts": ["Día","Estrella","Calor"],
    "ans": 0,
    "expl": "Cuerpo celeste que domina cada período.",
    "context": null
},
{
    "id": 643,
    "section": "17. Comprensión Verbal",
    "q": "Sinónimo de 'plausible':",
    "visual": null,
    "opts": ["Imposible","Creíble","Absurdo"],
    "ans": 1,
    "expl": "Que parece razonable.",
    "context": null
},
{
    "id": 644,
    "section": "18. Razonamiento Numérico",
    "q": "Si 5 trabajadores hacen un trabajo en 10 días, ¿cuántos días tardan 10 trabajadores?",
    "visual": null,
    "opts": ["5","20","15"],
    "ans": 0,
    "expl": "Inversamente proporcional.",
    "context": null
},
{
    "id": 645,
    "section": "18. Razonamiento Numérico",
    "q": "Si un objeto cuesta $120 con 20% de descuento, ¿cuál era el precio original?",
    "visual": null,
    "opts": ["$140","$144","$150"],
    "ans": 2,
    "expl": "120 = 0.80x → x = 150.",
    "context": null
},
{
    "id": 646,
    "section": "18. Razonamiento Numérico",
    "q": "¿Cuánto es el 30% de 250?",
    "visual": null,
    "opts": ["65","75","85"],
    "ans": 1,
    "expl": "0.30 × 250 = 75.",
    "context": null
},
{
    "id": 647,
    "section": "18. Razonamiento Numérico",
    "q": "Si compro 3 artículos a $15 cada uno con IVA 16%, ¿cuánto pago?",
    "visual": null,
    "opts": ["$49.20","$52.20","$55.20"],
    "ans": 1,
    "expl": "3 × 15 = 45 × 1.16 = 52.20.",
    "context": null
},
{
    "id": 648,
    "section": "18. Razonamiento Numérico",
    "q": "Un tren recorre 450 km en 3 horas. ¿A qué velocidad va?",
    "visual": null,
    "opts": ["130 km/h","150 km/h","170 km/h"],
    "ans": 1,
    "expl": "450 ÷ 3 = 150.",
    "context": null
},
{
    "id": 649,
    "section": "18. Razonamiento Numérico",
    "q": "Si gano $15,000 al mes y ahorro el 25%, ¿cuánto ahorro al año?",
    "visual": null,
    "opts": ["$35,000","$45,000","$55,000"],
    "ans": 1,
    "expl": "15000 × 0.25 × 12 = 45,000.",
    "context": null
},
{
    "id": 650,
    "section": "18. Razonamiento Numérico",
    "q": "¿Cuántos segundos hay en 2.5 horas?",
    "visual": null,
    "opts": ["7,500","9,000","10,000"],
    "ans": 1,
    "expl": "2.5 × 60 × 60 = 9,000.",
    "context": null
},
{
    "id": 651,
    "section": "18. Razonamiento Numérico",
    "q": "Si 1 dólar = 17 pesos, ¿cuántos pesos son 50 dólares?",
    "visual": null,
    "opts": ["750","850","950"],
    "ans": 1,
    "expl": "50 × 17 = 850.",
    "context": null
},
{
    "id": 652,
    "section": "18. Razonamiento Numérico",
    "q": "¿Cuál es el 15% de propina sobre una cuenta de $380?",
    "visual": null,
    "opts": ["$47","$57","$67"],
    "ans": 1,
    "expl": "380 × 0.15 = 57.",
    "context": null
},
{
    "id": 653,
    "section": "18. Razonamiento Numérico",
    "q": "Si un tanque se llena al 75% con 600 litros, ¿cuál es su capacidad total?",
    "visual": null,
    "opts": ["700 L","800 L","900 L"],
    "ans": 1,
    "expl": "600 ÷ 0.75 = 800.",
    "context": null
},
{
    "id": 654,
    "section": "18. Razonamiento Numérico",
    "q": "Un coche consume 8L/100km. ¿Cuántos litros necesita para 350 km?",
    "visual": null,
    "opts": ["24","28","32"],
    "ans": 1,
    "expl": "8 × 3.5 = 28.",
    "context": null
},
{
    "id": 655,
    "section": "18. Razonamiento Numérico",
    "q": "Si 6 personas comparten una cuenta de $1,200, ¿cuánto paga cada una?",
    "visual": null,
    "opts": ["$180","$200","$220"],
    "ans": 1,
    "expl": "1200 ÷ 6 = 200.",
    "context": null
},
{
    "id": 656,
    "section": "18. Razonamiento Numérico",
    "q": "¿Cuántos cuadrados de 2cm caben en un rectángulo de 8cm × 6cm?",
    "visual": null,
    "opts": ["10","12","14"],
    "ans": 1,
    "expl": "(8÷2) × (6÷2) = 4 × 3 = 12.",
    "context": null
},
{
    "id": 657,
    "section": "18. Razonamiento Numérico",
    "q": "Si Pedro tiene el triple que Juan y Juan tiene $500, ¿cuánto tienen juntos?",
    "visual": null,
    "opts": ["$1,500","$2,000","$2,500"],
    "ans": 1,
    "expl": "Pedro = 1500. Juntos = 500 + 1500 = 2000.",
    "context": null
},
{
    "id": 658,
    "section": "18. Razonamiento Numérico",
    "q": "Un reloj se atrasa 5 min cada hora. Si lo pongo a las 12:00, ¿qué hora marcará cuando sean las 6 PM?",
    "visual": null,
    "opts": ["5:00 PM","5:30 PM","5:15 PM"],
    "ans": 1,
    "expl": "6 horas × 5 min = 30 min de atraso. Marca 5:30.",
    "context": null
},
{
    "id": 659,
    "section": "18. Razonamiento Numérico",
    "q": "Si una pizza de 8 rebanadas cuesta $160 y quiero 3, ¿cuánto pago?",
    "visual": null,
    "opts": ["$50","$60","$70"],
    "ans": 1,
    "expl": "160÷8 = 20 por rebanada. 20×3 = 60.",
    "context": null
},
{
    "id": 660,
    "section": "18. Razonamiento Numérico",
    "q": "¿Cuántas docenas hay en 144 unidades?",
    "visual": null,
    "opts": ["10","12","14"],
    "ans": 1,
    "expl": "144 ÷ 12 = 12 docenas (una gruesa).",
    "context": null
},
{
    "id": 661,
    "section": "18. Razonamiento Numérico",
    "q": "Si duplico un número y le resto 10, obtengo 30. ¿Cuál es el número?",
    "visual": null,
    "opts": ["15","20","25"],
    "ans": 1,
    "expl": "2x - 10 = 30 → 2x = 40 → x = 20.",
    "context": null
},
{
    "id": 662,
    "section": "18. Razonamiento Numérico",
    "q": "¿Cuánto es 3⁴?",
    "visual": null,
    "opts": ["27","81","64"],
    "ans": 1,
    "expl": "3×3×3×3 = 81.",
    "context": null
},
{
    "id": 663,
    "section": "18. Razonamiento Numérico",
    "q": "Un producto subió de $200 a $250. ¿Cuál fue el porcentaje de aumento?",
    "visual": null,
    "opts": ["20%","25%","30%"],
    "ans": 1,
    "expl": "(250-200)/200 × 100 = 25%.",
    "context": null
},
{
    "id": 664,
    "section": "18. Razonamiento Numérico",
    "q": "Si camino 4 km en 40 min, ¿cuánto tardaré en recorrer 10 km?",
    "visual": null,
    "opts": ["80 min","100 min","120 min"],
    "ans": 1,
    "expl": "4km/40min = 0.1 km/min. 10/0.1 = 100 min.",
    "context": null
},
{
    "id": 665,
    "section": "18. Razonamiento Numérico",
    "q": "En una clase de 30 alumnos, 18 aprobaron. ¿Qué porcentaje reprobó?",
    "visual": null,
    "opts": ["30%","40%","50%"],
    "ans": 1,
    "expl": "Reprobaron 12. 12/30 × 100 = 40%.",
    "context": null
},
{
    "id": 666,
    "section": "18. Razonamiento Numérico",
    "q": "Si la edad de Ana es el doble de la de Luis más 3, y Luis tiene 10, ¿cuántos años tiene Ana?",
    "visual": null,
    "opts": ["20","23","25"],
    "ans": 1,
    "expl": "2(10) + 3 = 23.",
    "context": null
},
{
    "id": 667,
    "section": "18. Razonamiento Numérico",
    "q": "¿Cuántos triángulos se forman al dividir un pentágono con diagonales desde un vértice?",
    "visual": null,
    "opts": ["2","3","4"],
    "ans": 1,
    "expl": "n-2 triángulos = 5-2 = 3.",
    "context": null
},
{
    "id": 668,
    "section": "18. Razonamiento Numérico",
    "q": "Si un libro cuesta $350 en librería y $280 en línea, ¿cuánto ahorro en porcentaje?",
    "visual": null,
    "opts": ["15%","20%","25%"],
    "ans": 1,
    "expl": "(350-280)/350 × 100 = 20%.",
    "context": null
},
{
    "id": 669,
    "section": "18. Razonamiento Numérico",
    "q": "¿Cuántas combinaciones de 2 sabores puedo hacer con 5 sabores de helado?",
    "visual": null,
    "opts": ["8","10","15"],
    "ans": 1,
    "expl": "C(5,2) = 5!/(2!×3!) = 10.",
    "context": null
},
{
    "id": 670,
    "section": "18. Razonamiento Numérico",
    "q": "Si 3 metros de tela cuestan $270, ¿cuánto cuestan 7 metros?",
    "visual": null,
    "opts": ["$560","$630","$700"],
    "ans": 1,
    "expl": "270÷3 = 90/metro. 90×7 = 630.",
    "context": null
},
{
    "id": 671,
    "section": "18. Razonamiento Numérico",
    "q": "Un terreno cuadrado tiene 100 m de perímetro. ¿Cuál es su área?",
    "visual": null,
    "opts": ["500 m²","625 m²","1000 m²"],
    "ans": 1,
    "expl": "Lado = 100÷4 = 25. Área = 25² = 625.",
    "context": null
},
{
    "id": 672,
    "section": "18. Razonamiento Numérico",
    "q": "Si invierto $5,000 al 10% anual simple, ¿cuánto tengo en 2 años?",
    "visual": null,
    "opts": ["$5,500","$6,000","$6,500"],
    "ans": 1,
    "expl": "I = 5000 × 0.10 × 2 = 1000. Total = 6000.",
    "context": null
},
{
    "id": 673,
    "section": "18. Razonamiento Numérico",
    "q": "¿Cuántas horas hay en una semana?",
    "visual": null,
    "opts": ["148","168","188"],
    "ans": 1,
    "expl": "7 × 24 = 168.",
    "context": null
},
{
    "id": 674,
    "section": "19. Excel y Habilidades Digitales",
    "q": "En Excel, ¿qué fórmula suma las celdas A1 a A10?",
    "visual": null,
    "opts": ["=SUMA(A1:A10)","=TOTAL(A1:A10)","=ADD(A1,A10)"],
    "ans": 0,
    "expl": "SUMA es la función estándar.",
    "context": null
},
{
    "id": 675,
    "section": "19. Excel y Habilidades Digitales",
    "q": "¿Qué función de Excel busca un valor en la primera columna de un rango?",
    "visual": null,
    "opts": ["BUSCARH","BUSCARV","ENCONTRAR"],
    "ans": 1,
    "expl": "BUSCARV (vertical).",
    "context": null
},
{
    "id": 676,
    "section": "19. Excel y Habilidades Digitales",
    "q": "El atajo Ctrl+C sirve para:",
    "visual": null,
    "opts": ["Cortar","Copiar","Pegar"],
    "ans": 1,
    "expl": "Copy.",
    "context": null
},
{
    "id": 677,
    "section": "19. Excel y Habilidades Digitales",
    "q": "En Excel, ¿qué significa el error #REF!?",
    "visual": null,
    "opts": ["Referencia circular","Referencia no válida","Valor no numérico"],
    "ans": 1,
    "expl": "La celda referenciada fue eliminada.",
    "context": null
},
{
    "id": 678,
    "section": "19. Excel y Habilidades Digitales",
    "q": "¿Qué función devuelve el promedio de un rango?",
    "visual": null,
    "opts": ["=MEDIA(A1:A10)","=PROMEDIO(A1:A10)","=AVG(A1:A10)"],
    "ans": 1,
    "expl": "PROMEDIO en español.",
    "context": null
},
{
    "id": 679,
    "section": "19. Excel y Habilidades Digitales",
    "q": "El símbolo $ en $A$1 indica:",
    "visual": null,
    "opts": ["Moneda","Referencia absoluta","Error"],
    "ans": 1,
    "expl": "No cambia al copiar la fórmula.",
    "context": null
},
{
    "id": 680,
    "section": "19. Excel y Habilidades Digitales",
    "q": "¿Qué tipo de gráfico es mejor para mostrar porcentajes de un total?",
    "visual": null,
    "opts": ["Barras","Circular (pastel)","Líneas"],
    "ans": 1,
    "expl": "Muestra partes del todo.",
    "context": null
},
{
    "id": 681,
    "section": "19. Excel y Habilidades Digitales",
    "q": "La función SI en Excel evalúa:",
    "visual": null,
    "opts": ["Una suma","Una condición lógica","Un promedio"],
    "ans": 1,
    "expl": "=SI(condición, verdadero, falso).",
    "context": null
},
{
    "id": 682,
    "section": "19. Excel y Habilidades Digitales",
    "q": "¿Qué atajo crea un filtro automático en Excel?",
    "visual": null,
    "opts": ["Ctrl+F","Ctrl+Shift+L","Ctrl+Alt+F"],
    "ans": 1,
    "expl": "Activa/desactiva filtros.",
    "context": null
},
{
    "id": 683,
    "section": "19. Excel y Habilidades Digitales",
    "q": "La función CONTAR.SI cuenta celdas que:",
    "visual": null,
    "opts": ["Contienen números","Cumplen un criterio","Están vacías"],
    "ans": 1,
    "expl": "CONTAR.SI(rango, criterio).",
    "context": null
},
{
    "id": 684,
    "section": "19. Excel y Habilidades Digitales",
    "q": "¿Qué es una tabla dinámica?",
    "visual": null,
    "opts": ["Una tabla con colores","Herramienta de análisis y resumen de datos","Una tabla con fórmulas"],
    "ans": 1,
    "expl": "Resume grandes volúmenes de información.",
    "context": null
},
{
    "id": 685,
    "section": "19. Excel y Habilidades Digitales",
    "q": "El formato condicional en Excel sirve para:",
    "visual": null,
    "opts": ["Proteger celdas","Cambiar el formato según reglas","Imprimir"],
    "ans": 1,
    "expl": "Resalta datos automáticamente.",
    "context": null
},
{
    "id": 686,
    "section": "19. Excel y Habilidades Digitales",
    "q": "¿Qué función concatena textos en Excel?",
    "visual": null,
    "opts": ["=UNIR","=CONCATENAR o &","=JUNTAR"],
    "ans": 1,
    "expl": "=CONCATENAR(A1,B1) o =A1&B1.",
    "context": null
},
{
    "id": 687,
    "section": "19. Excel y Habilidades Digitales",
    "q": "En Excel, Ctrl+Z sirve para:",
    "visual": null,
    "opts": ["Zoom","Deshacer","Guardar"],
    "ans": 1,
    "expl": "Undo.",
    "context": null
},
{
    "id": 688,
    "section": "19. Excel y Habilidades Digitales",
    "q": "¿Qué función devuelve la fecha actual?",
    "visual": null,
    "opts": ["=FECHA()","=HOY()","=AHORA()"],
    "ans": 1,
    "expl": "HOY() devuelve la fecha sin hora.",
    "context": null
},
{
    "id": 689,
    "section": "19. Excel y Habilidades Digitales",
    "q": "El error #DIV/0! ocurre cuando:",
    "visual": null,
    "opts": ["Falta un paréntesis","Se divide entre cero","El texto es muy largo"],
    "ans": 1,
    "expl": "División por cero no permitida.",
    "context": null
},
{
    "id": 690,
    "section": "19. Excel y Habilidades Digitales",
    "q": "¿Qué función de Excel cuenta celdas con números?",
    "visual": null,
    "opts": ["CONTAR","CONTARA","CONTAR.SI"],
    "ans": 0,
    "expl": "CONTAR solo cuenta números.",
    "context": null
},
{
    "id": 691,
    "section": "19. Excel y Habilidades Digitales",
    "q": "La función SUMAR.SI suma valores que:",
    "visual": null,
    "opts": ["Son mayores que cero","Cumplen una condición","Están en negrita"],
    "ans": 1,
    "expl": "SUMAR.SI(rango_criterio, criterio, rango_suma).",
    "context": null
},
{
    "id": 692,
    "section": "19. Excel y Habilidades Digitales",
    "q": "¿Cuál es la extensión de un archivo Excel moderno?",
    "visual": null,
    "opts": [".xls",".xlsx",".xlm"],
    "ans": 1,
    "expl": "Formato XML desde Office 2007.",
    "context": null
},
{
    "id": 693,
    "section": "19. Excel y Habilidades Digitales",
    "q": "¿Qué herramienta de Excel permite ordenar datos?",
    "visual": null,
    "opts": ["Formato condicional","Ordenar y filtrar","Validación de datos"],
    "ans": 1,
    "expl": "Ordena por columnas ascendente/descendente.",
    "context": null
},
{
    "id": 694,
    "section": "19. Excel y Habilidades Digitales",
    "q": "La función SI.ERROR sirve para:",
    "visual": null,
    "opts": ["Contar errores","Mostrar un valor alternativo si hay error","Borrar errores"],
    "ans": 1,
    "expl": "=SI.ERROR(fórmula, valor_si_error).",
    "context": null
},
{
    "id": 695,
    "section": "19. Excel y Habilidades Digitales",
    "q": "¿Qué hace la función INDICE+COINCIDIR?",
    "visual": null,
    "opts": ["Grafica datos","Busca valores de forma flexible","Formatea celdas"],
    "ans": 1,
    "expl": "Alternativa más potente a BUSCARV.",
    "context": null
},
{
    "id": 696,
    "section": "19. Excel y Habilidades Digitales",
    "q": "¿Qué atajo selecciona toda la hoja en Excel?",
    "visual": null,
    "opts": ["Ctrl+A","Ctrl+E","Ctrl+S"],
    "ans": 0,
    "expl": "Select All.",
    "context": null
},
{
    "id": 697,
    "section": "19. Excel y Habilidades Digitales",
    "q": "La validación de datos en Excel permite:",
    "visual": null,
    "opts": ["Proteger el archivo","Restringir lo que se puede ingresar en una celda","Cambiar colores"],
    "ans": 1,
    "expl": "Listas desplegables, rangos numéricos, etc.",
    "context": null
},
{
    "id": 698,
    "section": "19. Excel y Habilidades Digitales",
    "q": "¿Para qué sirve la función TEXTO en Excel?",
    "visual": null,
    "opts": ["Escribir texto automáticamente","Dar formato a números como texto","Contar caracteres"],
    "ans": 1,
    "expl": "=TEXTO(valor, formato). Ej: =TEXTO(A1,'dd/mm/yyyy').",
    "context": null
},
{
    "id": 699,
    "section": "19. Excel y Habilidades Digitales",
    "q": "El gráfico de barras es ideal para:",
    "visual": null,
    "opts": ["Comparar categorías","Mostrar tendencias temporales","Relaciones entre variables"],
    "ans": 0,
    "expl": "Compara magnitudes entre categorías.",
    "context": null
},
{
    "id": 700,
    "section": "19. Excel y Habilidades Digitales",
    "q": "¿Qué función cuenta celdas NO vacías?",
    "visual": null,
    "opts": ["CONTAR","CONTARA","CONTAR.BLANCO"],
    "ans": 1,
    "expl": "CONTARA cuenta cualquier celda con contenido.",
    "context": null
},
{
    "id": 701,
    "section": "19. Excel y Habilidades Digitales",
    "q": "¿Qué es un rango en Excel?",
    "visual": null,
    "opts": ["Una fórmula","Un grupo de celdas seleccionadas","Un tipo de gráfico"],
    "ans": 1,
    "expl": "Ej: A1:C10 es un rango.",
    "context": null
},
{
    "id": 702,
    "section": "19. Excel y Habilidades Digitales",
    "q": "Ctrl+S en cualquier programa sirve para:",
    "visual": null,
    "opts": ["Seleccionar","Guardar","Subrayar"],
    "ans": 1,
    "expl": "Save.",
    "context": null
},
{
    "id": 703,
    "section": "19. Excel y Habilidades Digitales",
    "q": "¿Qué función redondea un número en Excel?",
    "visual": null,
    "opts": ["=REDONDEAR","=CORTAR","=TRUNCAR"],
    "ans": 0,
    "expl": "=REDONDEAR(número, decimales).",
    "context": null
},
];
