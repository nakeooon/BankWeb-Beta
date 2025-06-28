document.addEventListener('DOMContentLoaded', () => {
    // --- Lógica de Navegación entre Secciones ---
    const navLinks = document.querySelectorAll('.main-nav ul li a'); // Todos los enlaces de navegación de la barra lateral
    const contentSections = document.querySelectorAll('.content-section'); // Todas las secciones de contenido

    // Función para mostrar la sección correcta y actualizar el estado activo de la navegación
    const showSection = (targetId) => {
        // Remover la clase 'active' de todos los enlaces de navegación
        navLinks.forEach(link => link.closest('li').classList.remove('active'));

        // Remover la clase 'active-content' de todas las secciones de contenido
        contentSections.forEach(section => {
            section.classList.remove('active-content');
            // Ocultar la sección completamente después de la transición
            setTimeout(() => {
                if (!section.classList.contains('active-content')) {
                    section.style.display = 'none';
                }
            }, 400); // Coincide con la duración de la transición CSS
        });

        // Añadir la clase 'active-content' a la sección de destino
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.style.display = 'flex'; // Mostrar antes de añadir la clase para la transición
            setTimeout(() => {
                targetSection.classList.add('active-content');
            }, 10); // Pequeño retraso para asegurar que la propiedad display se aplique antes de la transición

            // Si la sección de estadísticas es la activa, generar los gráficos
            if (targetId === 'statistics-content') {
                generateRandomCharts();
            }
        }

        // Encontrar el enlace de navegación correspondiente y añadirle la clase 'active'
        const activeNavLink = document.querySelector(`.main-nav ul li a[data-target="${targetId}"]`);
        if (activeNavLink) {
            activeNavLink.closest('li').classList.add('active');
        }

        // Asegurarse de cerrar el modal de detalles de tarjeta al cambiar de sección
        hideCardInfoModal();
    };

    // Añadir event listeners a los enlaces de navegación
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Prevenir el comportamiento por defecto del enlace
            const targetId = link.dataset.target; // Obtener el ID de la sección objetivo
            showSection(targetId);
        });
    });

    // Manejar el clic en "Ver todas las transacciones" en el dashboard
    const viewAllTransactionsBtn = document.querySelector('.view-all-transactions');
    if (viewAllTransactionsBtn) {
        viewAllTransactionsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = viewAllTransactionsBtn.dataset.target;
            showSection(targetId);
        });
    }

    // --- Lógica para animar los contadores (balance, ingresos, gastos) ---
    const animateValue = (obj, start, end, duration) => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = parseFloat(start) + (parseFloat(end) - parseFloat(start)) * progress;
            obj.textContent = value.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    };

    // Obtener los elementos de balance del dashboard
    const balanceElement = document.querySelector('.balance-card h3');
    const incomeElement = document.querySelector('.income-card h4');
    const expenseElement = document.querySelector('.expense-card h4');

    // Valores iniciales (se podrían obtener de una API en un proyecto real)
    const currentBalance = 12450.75;
    const currentIncome = 3200.00;
    const currentExpense = 1100.20;

    // Ejecutar animación al cargar la página (solo si la sección dashboard está activa)
    const dashboardSection = document.getElementById('dashboard-content');
    if (dashboardSection && dashboardSection.classList.contains('active-content')) {
        animateValue(balanceElement, 0, currentBalance, 1500);
        animateValue(incomeElement, 0, currentIncome, 1200);
        animateValue(expenseElement, 0, currentExpense, 1200);
    }


    // --- Lógica del Modal General (Ventana Emergente para Añadir Tarjeta/Meta) ---
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const closeModalBtn = modal.querySelector('.close-button'); // Selector más específico
    const modalConfirmBtn = document.getElementById('modal-confirm-btn');

    // Función para mostrar el modal general
    const showModal = (title, bodyHtml, confirmAction = () => alert('Acción confirmada!')) => {
        modalTitle.textContent = title;
        modalBody.innerHTML = bodyHtml;
        modalConfirmBtn.onclick = confirmAction; // Asignar la acción al botón de confirmar
        modal.classList.add('show');
    };

    // Función para ocultar el modal general
    const hideModal = () => {
        modal.classList.remove('show');
    };

    // Event listeners para cerrar el modal general
    closeModalBtn.addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => { // Cerrar al hacer clic fuera del contenido
        if (e.target === modal) {
            hideModal();
        }
    });

    // Event listeners para los botones que abren el modal general
    const addCardBtns = document.querySelectorAll('.add-card-btn');
    addCardBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const modalType = btn.dataset.modalType;
            if (modalType === 'add-card' || modalType === 'add-card-full') {
                showModal(
                    'Añadir Nueva Tarjeta',
                    `<div class="modal-body-content">
                        <div class="form-group">
                            <label for="cardNumber">Número de Tarjeta:</label>
                            <input type="text" id="cardNumber" placeholder="XXXX XXXX XXXX XXXX" maxlength="19" pattern="[0-9 ]{19}" title="Introduce un número de tarjeta válido de 16 dígitos" required>
                        </div>
                        <div class="form-group">
                            <label for="cardName">Nombre del Titular:</label>
                            <input type="text" id="cardName" placeholder="Nombre en la tarjeta" required>
                        </div>
                        <div class="form-group-inline">
                            <div class="form-group">
                                <label for="expiryDate">Fecha de Caducidad:</label>
                                <input type="text" id="expiryDate" placeholder="MM/AA" maxlength="5" pattern="(0[1-9]|1[0-2])\\/[0-9]{2}" title="Formato: MM/AA" required>
                            </div>
                            <div class="form-group">
                                <label for="cvv">CVV:</label>
                                <input type="text" id="cvv" placeholder="XXX" maxlength="4" pattern="[0-9]{3,4}" title="Introduce 3 o 4 dígitos" required>
                            </div>
                        </div>
                        <p class="disclaimer"><em>(Esta es una funcionalidad de demostración. Los datos no se guardan).</em></p>
                    </div>`,
                    () => {
                        const cardNumber = document.getElementById('cardNumber').value;
                        const cardName = document.getElementById('cardName').value;
                        const expiryDate = document.getElementById('expiryDate').value;
                        const cvv = document.getElementById('cvv').value;

                        // Validaciones básicas del formulario de añadir tarjeta
                        if (!cardNumber.match(/^[0-9 ]{19}$/) || !cardName || !expiryDate.match(/^(0[1-9]|1[0-2])\/[0-9]{2}$/) || !cvv.match(/^[0-9]{3,4}$/)) {
                            alert('Por favor, completa todos los campos con un formato válido.');
                            return;
                        }

                        alert(`¡Solicitud de tarjeta enviada!\nNúmero: ${cardNumber}\nTitular: ${cardName}\nRecibirás una confirmación pronto.`);
                        hideModal();
                    }
                );
            }
        });
    });

    const addGoalBtns = document.querySelectorAll('.add-goal-btn');
    addGoalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            showModal(
                'Añadir Nueva Meta de Ahorro',
                `<div class="modal-body-content">
                    <div class="form-group">
                        <label for="goalName">Nombre de la Meta:</label>
                        <input type="text" id="goalName" placeholder="Ej: Coche Nuevo" required>
                    </div>
                    <div class="form-group">
                        <label for="goalAmount">Monto Objetivo:</label>
                        <input type="number" id="goalAmount" placeholder="Ej: 15000" min="0" required>
                    </div>
                    <p class="disclaimer"><em>(Esta es una funcionalidad de demostración. Los datos no se guardan).</em></p>
                </div>`,
                () => {
                    const goalName = document.getElementById('goalName').value;
                    const goalAmount = document.getElementById('goalAmount').value;
                    if (goalName && goalAmount) {
                        alert(`¡Tu nueva meta "${goalName}" con objetivo de $${parseFloat(goalAmount).toLocaleString()}" ha sido creada!`);
                        hideModal();
                    } else {
                        alert('Por favor, completa todos los campos.');
                    }
                }
            );
        });
    });

    // --- Lógica del Nuevo Modal Central para Detalles de Tarjeta ---
    const cardInfoModal = document.getElementById('card-info-modal');
    const cardInfoModalCloseBtn = cardInfoModal.querySelector('.close-button');
    const pinInputs = [];
    for (let i = 1; i <= 4; i++) { // Cuatro inputs de PIN
        pinInputs.push(document.getElementById(`pinInput${i}`));
    }
    const pinErrorMessage = document.getElementById('pin-error-message');
    const verifyPinBtn = document.getElementById('verifyPinBtn');
    const pinEntryForm = document.getElementById('pin-entry-form');
    const cardDetailsDisplay = document.getElementById('card-details-display'); // Contenedor de la tarjeta virtual
    const virtualCard = document.querySelector('.virtual-card'); // La tarjeta virtual dentro del display

    const CORRECT_PIN = '1706'; // PIN de seguridad

    // Event listeners para los inputs individuales del PIN
    pinInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            // Permitir solo números y que solo haya un dígito
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
            if (e.target.value.length === 1 && index < pinInputs.length - 1) {
                pinInputs[index + 1].focus(); // Mover el foco al siguiente input
            }
            pinErrorMessage.textContent = ''; // Limpiar mensaje de error al escribir
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
                pinInputs[index - 1].focus(); // Mover el foco al input anterior con Backspace
            } else if (e.key === 'Enter') {
                verifyPinBtn.click(); // Activar el botón de verificar con Enter
            }
        });
    });

    // Event listener para abrir el modal de información de tarjeta
    const clickableCreditCards = document.querySelectorAll('.credit-card');
    clickableCreditCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Prevenir que el click en la tarjeta principal active el modal si es el mismo
            // o si el click proviene de un elemento anidado que no es la tarjeta misma
            if (!e.currentTarget.classList.contains('credit-card')) {
                return;
            }

            // Cerrar el modal general si está abierto
            if (modal.classList.contains('show')) {
                hideModal();
            }

            // Resetear el formulario del PIN
            pinInputs.forEach(input => input.value = '');
            if (pinInputs.length > 0) pinInputs[0].focus(); // Enfocar el primer input del PIN
            pinErrorMessage.textContent = '';
            pinEntryForm.style.display = 'flex'; // Mostrar formulario de PIN
            cardDetailsDisplay.style.display = 'none'; // Ocultar detalles (el contenedor de la tarjeta virtual)
            cardDetailsDisplay.classList.remove('show'); // Remover clase de animación por si estaba

            // Obtener el tipo de tarjeta del atributo data-card-type
            const cardType = card.dataset.cardType;
            if (cardType) {
                // Aplicar la clase de gradiente correcta a la tarjeta virtual en el modal
                virtualCard.classList.remove('visa', 'mastercard', 'amex');
                virtualCard.classList.add(cardType.toLowerCase()); // ej., 'visa'

                // Actualizar el tipo de tarjeta y el logo en la cabecera de la tarjeta virtual
                document.getElementById('virtualCardType').textContent = cardType.toUpperCase();
                document.getElementById('virtualCardLogo').className = `fab fa-cc-${cardType.toLowerCase()}`;
            }

            cardInfoModal.classList.add('show'); // Mostrar el modal de info de tarjeta
        });
    });

    // Event listener para el botón de verificar PIN
    verifyPinBtn.addEventListener('click', () => {
        const enteredPin = pinInputs.map(input => input.value).join(''); // Combinar todos los dígitos del PIN
        if (enteredPin.length < 4) { // Asegurarse de que se hayan ingresado 4 dígitos
            pinErrorMessage.textContent = 'Por favor, ingresa los 4 dígitos del PIN.';
            return;
        }

        if (enteredPin === CORRECT_PIN) {
            pinErrorMessage.textContent = '';
            pinEntryForm.style.display = 'none'; // Ocultar formulario de PIN
            generateAndDisplayCardDetails(); // Generar y mostrar detalles
            cardDetailsDisplay.style.display = 'block'; // Mostrar el contenedor de la tarjeta virtual
            cardDetailsDisplay.classList.add('show'); // Activar animación de entrada para la tarjeta virtual
        } else {
            pinErrorMessage.textContent = 'PIN incorrecto. Inténtalo de nuevo.';
            pinInputs.forEach(input => input.value = ''); // Limpiar todos los campos del PIN
            if (pinInputs.length > 0) pinInputs[0].focus(); // Re-enfocar en el primer input
        }
    });

    // Event listener para cerrar el modal de información de tarjeta
    cardInfoModalCloseBtn.addEventListener('click', hideCardInfoModal);
    cardInfoModal.addEventListener('click', (e) => {
        if (e.target === cardInfoModal) { // Solo cerrar si se hace clic en el fondo oscuro
            hideCardInfoModal();
        }
    });

    function hideCardInfoModal() {
        cardInfoModal.classList.remove('show');
        cardDetailsDisplay.classList.remove('show'); // Remover clase de animación al cerrar
        // Retrasar el `display: none` para que la transición de salida se vea
        setTimeout(() => {
            cardDetailsDisplay.style.display = 'none';
            pinEntryForm.style.display = 'flex'; // Asegurarse de que el formulario del PIN esté visible al reabrir
        }, 400); // Duración de la transición de opacidad/transformación
    }

    // Funciones helper para generar datos aleatorios
    const getRandomNumber = (length) => {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += Math.floor(Math.random() * 10);
        }
        return result;
    };

    const getRandomMonth = () => {
        const month = getRandom(1, 12);
        return month < 10 ? '0' + month : month.toString();
    };

    const getRandomYear = () => {
        const currentYearTwoDigits = new Date().getFullYear() % 100;
        const year = getRandom(currentYearTwoDigits + 1, currentYearTwoDigits + 5); // Desde el año siguiente hasta 5 años más
        return year < 10 ? '0' + year : year.toString();
    };

    const generateRandomIBAN = () => {
        const countryCode = 'ES'; // España
        const checkDigits = getRandomNumber(2);
        const bankCode = getRandomNumber(4);
        const branchCode = getRandomNumber(4);
        const accountNumber = getRandomNumber(10); // Los últimos 10 dígitos suelen ser el número de cuenta
        return `${countryCode}${checkDigits} ${bankCode} ${branchCode} ${getRandomNumber(4)} ${getRandomNumber(4)} ${accountNumber}`;
    };

    const getRandomStatus = () => {
        const statuses = ['Activa', 'Bloqueada', 'Expirada', 'Pendiente'];
        return statuses[Math.floor(Math.random() * statuses.length)];
    };
    
    const getRandomCardHolderName = () => {
        const firstNames = ['María', 'Juan', 'Ana', 'Luis', 'Sofía', 'Carlos', 'Andrea', 'Pedro'];
        const lastNames = ['García', 'Martínez', 'Pérez', 'Rodríguez', 'González', 'López', 'Sánchez', 'Fernández'];
        return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    };

    // Función para generar y mostrar los detalles de la tarjeta dentro del virtual-card
    const generateAndDisplayCardDetails = () => {
        document.getElementById('detail-card-number').textContent = `${getRandomNumber(4)} ${getRandomNumber(4)} ${getRandomNumber(4)} ${getRandomNumber(4)}`;
        document.getElementById('detail-cvv').textContent = getRandomNumber(3);
        document.getElementById('detail-card-pin').textContent = getRandomNumber(4); // PIN de la tarjeta (no el de seguridad)
        document.getElementById('detail-expiry').textContent = `${getRandomMonth()}/${getRandomYear()}`;
        document.getElementById('detail-iban').textContent = generateRandomIBAN();
        document.getElementById('detail-status').textContent = getRandomStatus();
        document.getElementById('detail-card-holder').textContent = getRandomCardHolderName();
    };


    // --- Generación de Gráficos Aleatorios (Estadísticas) ---

    // Función para generar un número aleatorio en un rango
    // Ya definida arriba: const getRandom = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    // Función para generar y renderizar el gráfico de barras
    const generateBarChart = () => {
        const chartContainer = document.getElementById('monthly-expenses-chart');
        if (!chartContainer) return;

        chartContainer.innerHTML = ''; // Limpiar barras anteriores
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
        const maxExpense = 1500; // Valor máximo para los gastos en el gráfico

        months.forEach((month, index) => {
            const expense = getRandom(200, maxExpense); // Gastos aleatorios entre 200 y 1500
            const barHeight = (expense / maxExpense) * 100; // Altura porcentual
            const bar = document.createElement('div');
            bar.classList.add('bar');
            bar.style.height = `${barHeight}%`;
            bar.style.transitionDelay = `${index * 0.1}s`; // Efecto de carga escalonado
            bar.setAttribute('title', `${month}: $${expense.toLocaleString()}`); // Tooltip

            // Mostrar el valor en la parte superior de la barra si el texto cabe
            const valueSpan = document.createElement('span');
            if (barHeight > 15) { // Solo mostrar si la barra es lo suficientemente alta
                valueSpan.textContent = `$${expense}`;
            }
            bar.appendChild(valueSpan);

            chartContainer.appendChild(bar);
        });
    };

    // Función para generar y renderizar el gráfico de líneas (usando Canvas)
    const generateLineChart = () => {
        const canvas = document.getElementById('money-flow-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar canvas

        const monthsCount = 6;
        const maxAmount = 5000;
        const incomes = [];
        const expenses = [];

        // Generar datos aleatorios para ingresos y gastos
        for (let i = 0; i < monthsCount; i++) {
            incomes.push(getRandom(2000, maxAmount));
            expenses.push(getRandom(800, incomes[i] - 100)); // Asegura que gastos sean menores que ingresos
        }

        const padding = 30; // Espaciado del borde del canvas
        const chartWidth = canvas.width - (padding * 2);
        const chartHeight = canvas.height - (padding * 2);
        const pointGap = chartWidth / (monthsCount - 1); // Espacio entre puntos

        // Escala vertical
        const yScale = (value) => (chartHeight - (value / maxAmount) * chartHeight) + padding;
        const xScale = (index) => (index * pointGap) + padding;

        // Propiedades de sombra para las líneas
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Dibujar ingresos (azul primary-color)
        ctx.beginPath();
        ctx.strokeStyle = '#007AFF'; // primary-color
        ctx.lineWidth = 3;
        ctx.moveTo(xScale(0), yScale(incomes[0]));
        for (let i = 1; i < monthsCount; i++) {
            ctx.lineTo(xScale(i), yScale(incomes[i]));
        }
        ctx.stroke();

        // Dibujar puntos de ingresos
        ctx.fillStyle = '#007AFF';
        for (let i = 0; i < monthsCount; i++) {
            ctx.beginPath();
            ctx.arc(xScale(i), yScale(incomes[i]), 5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Dibujar gastos (rojo danger-color)
        ctx.beginPath();
        ctx.strokeStyle = '#dc3545'; // danger-color
        ctx.lineWidth = 3;
        ctx.moveTo(xScale(0), yScale(expenses[0]));
        for (let i = 1; i < monthsCount; i++) {
            ctx.lineTo(xScale(i), yScale(expenses[i]));
        }
        ctx.stroke();

        // Dibujar puntos de gastos
        ctx.fillStyle = '#dc3545';
        for (let i = 0; i < monthsCount; i++) {
            ctx.beginPath();
            ctx.arc(xScale(i), yScale(expenses[i]), 5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Resetear sombras para el resto del canvas
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Dibujar ejes (opcional, para claridad)
        ctx.strokeStyle = '#E0E6ED'; // border-color
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.stroke();
    };

    // Función principal para generar todos los gráficos
    const generateRandomCharts = () => {
        generateBarChart();
        generateLineChart();
    };

    // --- Mini-interacción para los botones de acción rápida ---
    const quickActionButtons = document.querySelectorAll('.action-grid button:not(.add-card-btn):not(.add-goal-btn):not(.filter-btn)');
    quickActionButtons.forEach(button => {
        button.addEventListener('click', () => {
            alert(`Has clicado en "${button.textContent.trim()}". ¡Esta es una demostración!`);
        });
    });

    // Manejo de la tarjeta activa en "Mis Tarjetas" (solo para el estilo visual)
    const cardsInCardsSection = document.querySelectorAll('#cards-content .credit-card');
    cardsInCardsSection.forEach(card => {
        card.addEventListener('click', () => {
            cardsInCardsSection.forEach(c => c.classList.remove('active-card'));
            card.classList.add('active-card');
        });
    });

    // Asegurarse de que el dashboard se muestre correctamente al cargar la página
    showSection('dashboard-content');
});
