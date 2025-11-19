
    document.addEventListener('DOMContentLoaded', () => {
      // --- Funções de Modal Customizado (substituem alert, confirm, prompt) ---
      
      // Função customizada para alert
      function customAlert(message, title = 'Aviso') {
        return new Promise((resolve) => {
          const modal = document.getElementById('custom-alert-modal');
          const titleEl = document.getElementById('custom-alert-title');
          const messageEl = document.getElementById('custom-alert-message');
          const okBtn = document.getElementById('custom-alert-ok');
          const closeBtn = document.getElementById('custom-alert-close');
          
          titleEl.textContent = title;
          messageEl.textContent = message;
          modal.classList.remove('hidden');
          
          const closeModal = () => {
            modal.classList.add('hidden');
            resolve();
          };
          
          okBtn.onclick = closeModal;
          closeBtn.onclick = closeModal;
          
          // Fecha ao clicar no overlay
          modal.onclick = (e) => {
            if (e.target === modal) {
              closeModal();
            }
          };
        });
      }
      
      // Função customizada para confirm
      function customConfirm(message, title = 'Confirmar') {
        return new Promise((resolve) => {
          const modal = document.getElementById('custom-confirm-modal');
          const titleEl = document.getElementById('custom-confirm-title');
          const messageEl = document.getElementById('custom-confirm-message');
          const yesBtn = document.getElementById('custom-confirm-yes');
          const noBtn = document.getElementById('custom-confirm-no');
          const closeBtn = document.getElementById('custom-confirm-close');
          
          titleEl.textContent = title;
          messageEl.textContent = message;
          modal.classList.remove('hidden');
          
          const closeModal = (result) => {
            modal.classList.add('hidden');
            resolve(result);
          };
          
          yesBtn.onclick = () => closeModal(true);
          noBtn.onclick = () => closeModal(false);
          closeBtn.onclick = () => closeModal(false);
          
          // Fecha ao clicar no overlay (retorna false)
          modal.onclick = (e) => {
            if (e.target === modal) {
              closeModal(false);
            }
          };
        });
      }
      
      // Função customizada para prompt
      function customPrompt(message, title = 'Entrada', defaultValue = '', isPassword = false) {
        return new Promise((resolve) => {
          const modal = document.getElementById('custom-prompt-modal');
          const titleEl = document.getElementById('custom-prompt-title');
          const messageEl = document.getElementById('custom-prompt-message');
          const inputEl = document.getElementById('custom-prompt-input');
          const okBtn = document.getElementById('custom-prompt-ok');
          const cancelBtn = document.getElementById('custom-prompt-cancel');
          const closeBtn = document.getElementById('custom-prompt-close');
          
          titleEl.textContent = title;
          messageEl.textContent = message;
          inputEl.value = defaultValue;
          
          // Define o tipo do input (password ou text)
          if (isPassword) {
            inputEl.type = 'password';
          } else {
            inputEl.type = 'text';
          }
          
          modal.classList.remove('hidden');
          
          // Foca no input e seleciona o texto
          setTimeout(() => {
            inputEl.focus();
            inputEl.select();
          }, 100);
          
          const closeModal = (result) => {
            modal.classList.add('hidden');
            inputEl.value = '';
            // Reseta o tipo para text após fechar
            inputEl.type = 'text';
            resolve(result);
          };
          
          const handleOk = () => {
            closeModal(inputEl.value);
          };
          
          okBtn.onclick = handleOk;
          cancelBtn.onclick = () => closeModal(null);
          closeBtn.onclick = () => closeModal(null);
          
          // Enter no input também confirma
          inputEl.onkeypress = (e) => {
            if (e.key === 'Enter') {
              handleOk();
            }
          };
          
          // Fecha ao clicar no overlay (retorna null)
          modal.onclick = (e) => {
            if (e.target === modal) {
              closeModal(null);
            }
          };
        });
      }
      
      // Substitui as funções nativas (mantém compatibilidade)
      window.alert = customAlert;
      window.confirm = customConfirm;
      window.prompt = customPrompt;
      
      // --- Constantes e Estado da Aplicação ---
  const textoInicial = `Qual e o seu maior sonho?
Para onde viajaria no tempo?
Qual sua comida favorita?
Qual superpoder escolheria?
Qual foi seu melhor dia?
Qual seu filme preferido?
O que te faz feliz?
Onde gostaria de ir?`;
      const cores = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
        '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
      ];
      
      const clampNumber = (value, min, max) => Math.min(Math.max(value, min), max);
      
      // Variáveis de estado
      let textoPerguntas = textoInicial;
      let perguntas = [];
      let spinning = false;
      let rotation = 0;
      let selectedQuestion = null;
      let sidebarOpen = false;
      
      // Variáveis dos Jogos
      let currentGame = null; // 'race', 'force'
      let battleModeEnabled = false; // Toggle do modo Battle (pode ser usado com qualquer jogo)
      let raceScoreCount = 0;
      let raceProgressPercent = 0;
      let totalPerguntasIniciais = 0; // Total de perguntas quando o jogo começou
      
      // Variáveis do Jogo da Forca
      let forceErrorCount = 0; // Contador de erros no jogo da forca (modo single player)
      let forceErrorCount1 = 0; // Contador de erros do Jogador 1 (modo Battle)
      let forceErrorCount2 = 0; // Contador de erros do Jogador 2 (modo Battle)
      const MAX_FORCE_ERRORS = 6; // Máximo de 6 partes do boneco
      
      // Variáveis do Modo Battle
      let raceScoreCount1 = 0; // Jogador 1 - acertos
      let raceScoreCount2 = 0; // Jogador 2 - acertos
      let raceErrosCount1 = 0; // Jogador 1 - erros
      let raceErrosCount2 = 0; // Jogador 2 - erros
      let raceProgressPercent1 = 0;
      let raceProgressPercent2 = 0;
      let currentPlayer = 1; // 1 ou 2
      let perguntasErradas = 0; // Conta perguntas erradas para ajustar o cálculo
      let perguntasJogador1 = []; // Perguntas do jogador 1 (50%)
      let perguntasJogador2 = []; // Perguntas do jogador 2 (50%)
      
      // Variáveis do Jogo da Palavra Secreta
      let wordSecret = ''; // Palavra secreta atual
      let wordDiscovered = []; // Array com as letras descobertas (true/false para cada posição)
      let wordTriedLetters = []; // Array com as letras já tentadas
      let wordScore = 0; // Contador de acertos (modo single player)
      let wordScore1 = 0; // Contador de acertos do Jogador 1 (modo Battle)
      let wordScore2 = 0; // Contador de acertos do Jogador 2 (modo Battle)
      let wordCanTryLetter = false; // Flag se pode tentar uma letra (após acertar)
      let wordList = []; // Lista de palavras fornecidas pelo usuário
      let wordListIndex = 0; // Índice atual na lista de palavras
      
      // Variáveis de Compartilhamento
      let gameSessionId = null; // ID da sessão do jogo compartilhado
      let isHost = false; // Se é o criador do jogo (host)
      let syncInterval = null; // Intervalo para sincronizar estado
      let jsonBinId = null; // ID do bin no JSONBin.io para sincronização entre dispositivos

      // Variáveis de Zoom
      let currentZoom = 1.0; // Zoom atual (1.0 = 100%)
      const zoomStep = 0.1; // Incremento/decremento do zoom
      const minZoom = 0.5; // Zoom mínimo (50%)
      const maxZoom = 2.0; // Zoom máximo (200%)

      // Variáveis do Jogo de Frases Pares
      let pairsPhrases = []; // Array com as frases e seus pares
      let currentPairPhrase = null; // Frase selecionada atualmente
      let pairsAnswered = 0; // Número de frases respondidas
      let pairsTotal = 0; // Total de frases disponíveis
      let selectedCards = []; // Cartões selecionados para formar par
      let matchedPairs = new Set(); // Pares já encontrados
      let gameCards = []; // Cartões do jogo embaralhados
      let pairsGameStarted = false; // Flag para controlar se o jogo visual foi iniciado
      let pairsPendingRemoval = new Set(); // Pares aguardando animação antes de sumir
      let pairsSelectionAvailable = false; // Controla se é permitido escolher pares

      // --- Referências do DOM ---
      const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
      const closeSidebarBtn = document.getElementById('close-sidebar-btn');
      const sidebar = document.getElementById('sidebar');
      const sidebarOverlay = document.getElementById('sidebar-overlay');
      const editorContainer = document.getElementById('editor-container');
      const questionsTextarea = document.getElementById('questions-textarea');
      const questionsCount = document.getElementById('questions-count');
      
      const rouletteContainer = document.getElementById('roulette-container');
      // CORREÇÃO: Esta referência estava a falhar porque o elemento não existia
      const wheelWrapper = document.getElementById('wheel-wrapper'); 
      const wheelSectors = document.getElementById('wheel-sectors');
      const wheelDraggable = document.getElementById('wheel-draggable');
      
      const spinBtn = document.getElementById('spin-btn');
      
      const finishedContainer = document.getElementById('finished-container');
      const restartBtn = document.getElementById('restart-btn');
      
      const modalContainer = document.getElementById('modal-container');
      const modalQuestionNum = document.getElementById('modal-question-num');
      const modalQuestionText = document.getElementById('modal-question-text');
      const modalCorrectBtn = document.getElementById('modal-correct-btn');
      const modalWrongBtn = document.getElementById('modal-wrong-btn');
      // CORREÇÃO: Adicionada a referência para o novo 'id'
      const modalContentDiv = document.getElementById('modal-content-div');

      // Referências do Controlador de Zoom
      const zoomController = document.getElementById('zoom-controller');
      const zoomInBtn = document.getElementById('zoom-in-btn');
      const zoomOutBtn = document.getElementById('zoom-out-btn');
      const zoomLevel = document.getElementById('zoom-level');

      const makeDraggable = (element, storageKey, options = {}) => {
        if (!element) {
          return;
        }

        const {
          ignoreSelectors = ['button', 'input', 'textarea', 'select', 'label', 'a', '[data-drag-ignore]'],
          preventDefault = true,
        } = options;

        let isDragging = false;
        let dragOffsetX = 0;
        let dragOffsetY = 0;
        let translateX = 0;
        let translateY = 0;

        const shouldIgnore = (target) => {
          if (!target) {
            return false;
          }
          return ignoreSelectors.some((selector) => {
            try {
              return target.closest(selector);
            } catch {
              return false;
            }
          });
        };

        const loadPosition = () => {
          if (!storageKey) {
            return;
          }
          try {
            const stored = localStorage.getItem(storageKey);
            if (!stored) {
              return;
            }
            const parsed = JSON.parse(stored);
            if (
              typeof parsed === 'object' &&
              parsed !== null &&
              Number.isFinite(parsed.x) &&
              Number.isFinite(parsed.y)
            ) {
              translateX = parsed.x;
              translateY = parsed.y;
            }
          } catch (error) {
            console.warn(`Não foi possível carregar a posição de ${storageKey}.`, error);
          }
        };

        const savePosition = () => {
          if (!storageKey) {
            return;
          }
          try {
            localStorage.setItem(storageKey, JSON.stringify({ x: translateX, y: translateY }));
          } catch (error) {
            console.warn(`Não foi possível salvar a posição de ${storageKey}.`, error);
          }
        };

        const updatePosition = () => {
          element.style.transform = `translate(${translateX}px, ${translateY}px)`;
        };

        loadPosition();
        updatePosition();

        element.addEventListener('pointerdown', (event) => {
          if (shouldIgnore(event.target)) {
            return;
          }

          isDragging = true;
          dragOffsetX = event.clientX - translateX;
          dragOffsetY = event.clientY - translateY;
          element.classList.add('dragging');
          try {
            element.setPointerCapture(event.pointerId);
          } catch {
            // Ignora se o ponteiro não puder ser capturado
          }
          if (preventDefault) {
            event.preventDefault();
          }
        });

        element.addEventListener('pointermove', (event) => {
          if (!isDragging) {
            return;
          }

          translateX = event.clientX - dragOffsetX;
          translateY = event.clientY - dragOffsetY;
          updatePosition();
        });

        const stopDrag = (event) => {
          if (!isDragging) {
            return;
          }

          isDragging = false;
          element.classList.remove('dragging');
          savePosition();

          try {
            if (element.hasPointerCapture(event.pointerId)) {
              element.releasePointerCapture(event.pointerId);
            }
          } catch {
            // Ignora se não houver captura
          }
        };

        element.addEventListener('pointerup', stopDrag);
        element.addEventListener('pointercancel', stopDrag);
      };

      function getCssVarNumber(variableName, fallback) {
        const computed = getComputedStyle(document.documentElement).getPropertyValue(variableName);
        const parsed = parseFloat(computed);
        return Number.isFinite(parsed) ? parsed : fallback;
      }

      function setPairsBoardSize(width, height, persist = true) {
        const clampedWidth = clampNumber(width, pairsSizeConfig.minWidth, pairsSizeConfig.maxWidth);
        const clampedHeight = clampNumber(height, pairsSizeConfig.minHeight, pairsSizeConfig.maxHeight);
        document.documentElement.style.setProperty('--pairs-panel-width', `${clampedWidth}px`);
        document.documentElement.style.setProperty('--pairs-board-height', `${clampedHeight}px`);

        if (!persist) {
          return;
        }

        try {
          localStorage.setItem(
            pairsSizeConfig.storageKey,
            JSON.stringify({ width: clampedWidth, height: clampedHeight })
          );
        } catch (error) {
          console.warn('Não foi possível salvar o tamanho do quadro de pares.', error);
        }
      }

      function loadPairsBoardSize() {
        try {
          const stored = localStorage.getItem(pairsSizeConfig.storageKey);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (
              parsed &&
              Number.isFinite(parsed.width) &&
              Number.isFinite(parsed.height)
            ) {
              setPairsBoardSize(parsed.width, parsed.height, false);
              return;
            }
          }
        } catch (error) {
          console.warn('Não foi possível carregar o tamanho do quadro de pares.', error);
        }

        setPairsBoardSize(pairsSizeConfig.defaultWidth, pairsSizeConfig.defaultHeight, false);
      }

      function updatePairsSelectionState() {
        if (!pairsLockOverlay) {
          return;
        }
        const shouldShowLock = currentGame === 'pairs' && pairsGameStarted && !pairsSelectionAvailable;
        if (shouldShowLock) {
          pairsLockOverlay.classList.remove('hidden');
        } else {
          pairsLockOverlay.classList.add('hidden');
        }
      }

      function setPairsSelectionAvailability(state) {
        pairsSelectionAvailable = !!state;
        updatePairsSelectionState();
      }

      function initPairsResizeHandles() {
        if (!pairsResizeHandles || pairsResizeHandles.length === 0) {
          return;
        }

        pairsResizeHandles.forEach((handle) => {
          handle.addEventListener('pointerdown', (event) => {
            startPairsResize(event, handle, handle.dataset.resizeHandle || 'both');
          });
        });

        function startPairsResize(event, handle, axis) {
          event.preventDefault();

          let isResizing = true;
          let pointerStartX = event.clientX;
          let pointerStartY = event.clientY;
          let startWidth = getCssVarNumber('--pairs-panel-width', pairsSizeConfig.defaultWidth);
          let startHeight = getCssVarNumber('--pairs-board-height', pairsSizeConfig.defaultHeight);
          let resizeAnimationFrame = null;
          let activePointerId = event.pointerId;
          const allowHorizontal = axis === 'both' || axis === 'horizontal';
          const allowVertical = axis === 'both' || axis === 'vertical';

          const requestPairsRepaint = () => {
            if (resizeAnimationFrame) {
              return;
            }
            resizeAnimationFrame = requestAnimationFrame(() => {
              resizeAnimationFrame = null;
              if (pairsGameStarted) {
                renderPairsBoard();
              }
            });
          };

          const handlePointerMove = (moveEvent) => {
            if (!isResizing) {
              return;
            }
            const deltaX = moveEvent.clientX - pointerStartX;
            const deltaY = moveEvent.clientY - pointerStartY;
            const nextWidth = allowHorizontal ? startWidth + deltaX : startWidth;
            const nextHeight = allowVertical ? startHeight + deltaY : startHeight;
            setPairsBoardSize(nextWidth, nextHeight);
            requestPairsRepaint();
          };

          const stopResize = () => {
            if (!isResizing) {
              return;
            }
            isResizing = false;
            document.body.classList.remove('pairs-resizing');
            document.removeEventListener('pointermove', handlePointerMove);
            document.removeEventListener('pointerup', stopResize);
            document.removeEventListener('pointercancel', stopResize);
            if (activePointerId !== null) {
              try {
                handle.releasePointerCapture(activePointerId);
              } catch {
                // Ignora erro de captura
              }
              activePointerId = null;
            }
            requestPairsRepaint();
          };

          document.body.classList.add('pairs-resizing');
          try {
            handle.setPointerCapture(activePointerId);
          } catch {
            // Ignora se não for possível capturar
          }

          document.addEventListener('pointermove', handlePointerMove);
          document.addEventListener('pointerup', stopResize);
          document.addEventListener('pointercancel', stopResize);
        }
      }

      // Referências dos Jogos
      const raceGameBtn = document.getElementById('race-game-btn');
      const forceGameBtn = document.getElementById('force-game-btn');
      const wordGameBtn = document.getElementById('word-game-btn');
      const pairsGameBtn = document.getElementById('pairs-game-btn');
      const noGameBtn = document.getElementById('no-game-btn');
      const battleModeToggle = document.getElementById('battle-mode-toggle');
      const raceGameContainer = document.getElementById('race-game-container');
      const forceGameContainer = document.getElementById('force-game-container');
      const wordGameContainer = document.getElementById('word-game-container');
      const pairsGameContainer = document.getElementById('pairs-game-container');
      const pairsPhrasesDisplay = document.getElementById('pairs-phrases-display');
      const pairsProgress = document.getElementById('pairs-progress');
      const pairsSetupMessage = document.getElementById('pairs-setup-message');
      const pairsSetupBtn = document.getElementById('pairs-setup-btn');
      const pairsBoardFrame = document.getElementById('pairs-board-frame');
      const pairsResizeHandles = document.querySelectorAll('[data-resize-handle]');
      const pairsLockOverlay = document.getElementById('pairs-lock-overlay');

      const pairsSizeConfig = {
        minWidth: 320,
        maxWidth: Number.POSITIVE_INFINITY,
        minHeight: 320,
        maxHeight: Number.POSITIVE_INFINITY,
        defaultWidth: 420,
        defaultHeight: 420,
        storageKey: 'learnland-pairs-board-size'
      };

      loadPairsBoardSize();
      initPairsResizeHandles();
      updatePairsSelectionState();

      let pairsWindowResizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(pairsWindowResizeTimeout);
        pairsWindowResizeTimeout = setTimeout(() => {
          if (pairsGameStarted) {
            renderPairsBoard();
          }
        }, 150);
      });

      console.log('=== DOM ELEMENTS CHECK ===');
      console.log('pairsGameContainer:', pairsGameContainer);
      console.log('pairsPhrasesDisplay:', pairsPhrasesDisplay);
      console.log('pairsProgress:', pairsProgress);
      console.log('pairsSetupMessage:', pairsSetupMessage);
      console.log('pairsSetupBtn:', pairsSetupBtn);

      const forceErrors = document.getElementById('force-errors');
      const forceErrorCountDisplay = document.getElementById('force-error-count');
      const forceSinglePlayer = document.getElementById('force-single-player');
      const forceBattleMode = document.getElementById('force-battle-mode');
      console.log('Elementos de Forca - forceSinglePlayer:', !!forceSinglePlayer, 'forceBattleMode:', !!forceBattleMode);
      const forceError1 = document.getElementById('force-error-1');
      const forceError2 = document.getElementById('force-error-2');
      const forceErrorCount1Display = document.getElementById('force-error-count-1');
      const forceErrorCount2Display = document.getElementById('force-error-count-2');

      makeDraggable(wheelDraggable, 'learnland-wheel-position');
      makeDraggable(raceGameContainer, 'learnland-race-position');
      makeDraggable(forceGameContainer, 'learnland-force-position');
      makeDraggable(wordGameContainer, 'learnland-word-position');
      // Permite arrastar o quadro de frases, mas ignora cliques nos cartões do jogo
      makeDraggable(pairsGameContainer, 'learnland-pairs-position', {
        ignoreSelectors: ['button', 'input', 'textarea', 'select', 'label', 'a', '[data-drag-ignore]', '[data-card-id]', '#pairs-phrases-display']
      });
      const raceCar = document.getElementById('race-car-1'); // Carro 1 (ou único no modo race)
      const raceCar1 = document.getElementById('race-car-1'); // Jogador 1
      const raceCar2 = document.getElementById('race-car-2'); // Jogador 2
      const smokeCar1 = document.getElementById('smoke-car-1'); // Fumaça do carro 1
      const smokeCar2 = document.getElementById('smoke-car-2'); // Fumaça do carro 2
      const raceProgress = document.getElementById('race-progress');
      const raceScore = document.getElementById('race-score');
      const raceSinglePlayer = document.getElementById('race-single-player');
      const raceBattleMode = document.getElementById('race-battle-mode');
      console.log('Elementos de Corrida - raceSinglePlayer:', !!raceSinglePlayer, 'raceBattleMode:', !!raceBattleMode);
      const raceScore1 = document.getElementById('race-score-1');
      const raceScore2 = document.getElementById('race-score-2');
      const raceProgress1 = document.getElementById('race-progress-1');
      const raceProgress2 = document.getElementById('race-progress-2');
      const currentPlayerDisplay = document.getElementById('current-player');
      
      // Referências do Jogo da Palavra Secreta
      const wordSinglePlayer = document.getElementById('word-single-player');
      const wordBattleMode = document.getElementById('word-battle-mode');
      console.log('Elementos de Palavra Secreta - wordSinglePlayer:', !!wordSinglePlayer, 'wordBattleMode:', !!wordBattleMode);
      const wordDisplay = document.getElementById('word-display');
      const wordDisplayBattle = document.getElementById('word-display-battle');
      const wordLetterInput = document.getElementById('word-letter-input');
      const wordLetterInputBattle = document.getElementById('word-letter-input-battle');
      const wordTryLetterBtn = document.getElementById('word-try-letter-btn');
      const wordTryLetterBtnBattle = document.getElementById('word-try-letter-btn-battle');
      const wordTriedLettersDisplay = document.getElementById('word-tried-letters');
      const wordTriedLettersBattleDisplay = document.getElementById('word-tried-letters-battle');
      const wordMessage = document.getElementById('word-message');
      const wordMessageBattle = document.getElementById('word-message-battle');
      const wordScoreDisplay = document.getElementById('word-score');
      const wordScore1Display = document.getElementById('word-score-1');
      const wordScore2Display = document.getElementById('word-score-2');
      const wordProgress = document.getElementById('word-progress');
      
      // Referências de Compartilhamento
      const shareGameBtn = document.getElementById('share-game-btn');
      const shareModal = document.getElementById('share-modal');
      const shareModalClose = document.getElementById('share-modal-close');
      const shareModalOk = document.getElementById('share-modal-ok');
      const shareLinkInput = document.getElementById('share-link-input');
      const shareCopyBtn = document.getElementById('share-copy-btn');

      // --- Funções ---

      /**
       * Aplica o zoom atual à página
       */
      function applyZoom() {
        // Aplica o zoom alterando a variável CSS --zoom-scale
        document.documentElement.style.setProperty('--zoom-scale', currentZoom);

        // Remove qualquer transform anterior do body
        document.body.style.transform = '';
        document.body.style.transformOrigin = '';

        // Atualiza o indicador de zoom
        zoomLevel.textContent = Math.round(currentZoom * 100) + '%';

        // Ajusta o overflow baseado no zoom (sempre hidden pois não há mais scaling)
        document.body.style.overflow = 'hidden';
      }

      /**
       * Aumenta o zoom
       */
      function zoomIn() {
        if (currentZoom < maxZoom) {
          currentZoom = Math.min(currentZoom + zoomStep, maxZoom);
          applyZoom();
        }
      }

      /**
       * Diminui o zoom
       */
      function zoomOut() {
        if (currentZoom > minZoom) {
          currentZoom = Math.max(currentZoom - zoomStep, minZoom);
          applyZoom();
        }
      }

      /**
       * Reseta o zoom para 100%
       */
      function resetZoom() {
        currentZoom = 1.0;
        applyZoom();
      }

      /**
       * Desenha os setores da roleta no SVG
       */
      function renderWheel() {
        // Agora o wheelSectors não deve ser null
        wheelSectors.innerHTML = ''; // Limpa os setores antigos
        if (perguntas.length === 0) return;

        const sectorAngle = 360 / perguntas.length;

        perguntas.forEach((item, i) => {
          const angulo = sectorAngle * i;
          const anguloRad = (angulo * Math.PI) / 180;
          const proximoAngulo = (sectorAngle * (i + 1) * Math.PI) / 180;

          const x1 = 100 + 95 * Math.cos(anguloRad - Math.PI / 2);
          const y1 = 100 + 95 * Math.sin(anguloRad - Math.PI / 2);
          const x2 = 100 + 95 * Math.cos(proximoAngulo - Math.PI / 2);
          const y2 = 100 + 95 * Math.sin(proximoAngulo - Math.PI / 2);

          const anguloMeio = angulo + sectorAngle / 2;
          const anguloMeioRad = (anguloMeio * Math.PI) / 180;
          const textX = 100 + 65 * Math.cos(anguloMeioRad - Math.PI / 2);
          const textY = 100 + 65 * Math.sin(anguloMeioRad - Math.PI / 2);

          const tamanhoFonte = perguntas.length <= 8 ? 24 :
                                perguntas.length <= 12 ? 20 :
                                perguntas.length <= 16 ? 16 :
                                perguntas.length <= 20 ? 14 : 12;

          const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('d', `M 100 100 L ${x1} ${y1} A 95 95 0 0 1 ${x2} ${y2} Z`);
          path.setAttribute('fill', cores[i % cores.length]);
          path.setAttribute('stroke', 'white');
          path.setAttribute('stroke-width', '2');
          
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', textX);
          text.setAttribute('y', textY);
          text.setAttribute('fill', 'white');
          text.setAttribute('font-size', tamanhoFonte);
          text.setAttribute('font-weight', 'bold');
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('dominant-baseline', 'middle');
          text.textContent = item.num;

          g.appendChild(path);
          g.appendChild(text);
          wheelSectors.appendChild(g);
        });
      }

      /**
       * Atualiza a visibilidade dos containers principais (roleta vs. fim de jogo)
       */
      function updateUI() {
        if (perguntas.length > 0) {
          rouletteContainer.classList.remove('hidden');
          // spinBtn.classList.remove('hidden'); // Esta linha já não é necessária
          finishedContainer.classList.add('hidden');
        } else {
          rouletteContainer.classList.add('hidden');
          // spinBtn.classList.add('hidden'); // Esta linha já não é necessária
          finishedContainer.classList.remove('hidden');
          
          // Se o jogo de corrida estiver ativo, atualiza o progresso final
          if (currentGame === 'race') {
            // Atualiza a posição do carro baseado no estado atual
            updateRaceCarPosition();
            
            // Se todas foram acertadas, o carro está na chegada
            if (raceProgressPercent >= 100 && perguntas.length === 0) {
              setTimeout(async () => {
                await triggerVictoryAnimation();
              }, 500);
            }
          } else if (battleModeEnabled && currentGame) {
            // Atualiza as posições dos carros no modo Battle
            updateBattleCarPositions();
          }
        }
      }

      /**
       * Processa o texto da textarea, atualiza o array de perguntas,
       * renderiza a roleta e atualiza a UI.
       */
      function updatePerguntas() {
        // Divide por ### e ignora entradas vazias
        const perguntasAnteriores = perguntas.length;
        // Divide por ### como separador
        const perguntasTexto = textoPerguntas
          .split('###')
          .map(p => p.trim())
          .filter(p => p.length > 0);
        
        // No modo Battle, preserva os números originais das perguntas existentes
        if (battleModeEnabled && currentGame && perguntas.length > 0) {
          // Mapeia perguntas existentes para preservar números
          const perguntasAtualizadas = perguntasTexto.map(texto => {
            // Procura se essa pergunta já existe (mesmo texto)
            const perguntaExistente = perguntas.find(p => p.pergunta === texto);
            if (perguntaExistente) {
              return { num: perguntaExistente.num, pergunta: texto };
            }
            // Se é uma nova pergunta, atribui um número maior que o máximo existente
            const maxNum = Math.max(...perguntas.map(p => p.num), 0);
            return { num: maxNum + 1, pergunta: texto };
          });
          perguntas = perguntasAtualizadas;
        } else {
          // Para outros modos ou quando não há perguntas anteriores, recalcula normalmente
          perguntas = perguntasTexto.map((p, i) => ({ num: i + 1, pergunta: p }));
        }
        
        questionsCount.textContent = perguntas.length;
        
        // No modo Battle, divide as perguntas entre os dois jogadores
        if (battleModeEnabled && currentGame && perguntas.length > 0) {
          // Divide as perguntas igualmente entre os dois jogadores
          const meio = Math.ceil(perguntas.length / 2);
          perguntasJogador1 = perguntas.slice(0, meio);
          perguntasJogador2 = perguntas.slice(meio);
        }
        
        // Se o jogo de corrida está ativo, recalcula a posição do carro em tempo real
        if (currentGame === 'race') {
          // Recalcula o progresso do carro baseado no novo total de perguntas
          // O carro se adapta automaticamente quando perguntas são adicionadas ou removidas
          updateRaceCarPosition();
        } else if (battleModeEnabled && currentGame) {
          // Recalcula as posições dos carros no modo Battle
          // Apenas recalcula se o número de perguntas mudou (adicionadas ou removidas)
          // Não recalculamos quando a pergunta é removida por erro, apenas quando é editada
          const diferenca = perguntas.length - perguntasAnteriores;
          if (diferenca !== 0) {
            // Apenas recalcula se perguntas foram adicionadas ou removidas manualmente
            updateBattleCarPositions();
          }
        }
        
        renderWheel();
        updateUI();
        
        // Salva o estado se houver sessão ativa
        if (gameSessionId) {
          saveGameState();
        }
      }

      /**
       * Mostra ou esconde o modal da pergunta.
       */
      function showModal(question) {
        // Verificações de segurança
        if (!modalContainer || !modalQuestionNum || !modalQuestionText) {
          console.error('Elementos do modal não encontrados!');
          return;
        }

        // --- LÓGICA DE FECHAR O MODAL ---
        // Se estamos fechando o modal (question é null) E havia uma pergunta selecionada...
          if (!question && selectedQuestion) {
          // ...então agora é a hora de remover a pergunta da lista.
          const novasPerguntas = perguntas.filter((p) => p.num !== selectedQuestion.num);
          // Atualiza o texto com separador ###
          textoPerguntas = novasPerguntas.map(p => p.pergunta).join('###');
          questionsTextarea.value = textoPerguntas; // Atualiza o textarea

          // No modo Battle, também remove a pergunta do conjunto do jogador que a respondeu
          // Verifica qual jogador tem a pergunta no seu conjunto (antes da alternância)
          if (battleModeEnabled && currentGame) {
            const pertenceJogador1 = perguntasJogador1.some(p => p.num === selectedQuestion.num);
            const pertenceJogador2 = perguntasJogador2.some(p => p.num === selectedQuestion.num);
            
            if (pertenceJogador1) {
              perguntasJogador1 = perguntasJogador1.filter(p => p.num !== selectedQuestion.num);
            }
            if (pertenceJogador2) {
              perguntasJogador2 = perguntasJogador2.filter(p => p.num !== selectedQuestion.num);
            }
          }

          // Atualiza o array de perguntas e re-renderiza a roleta (com um item a menos)
          updatePerguntas();

          // --- ADIÇÃO CRÍTICA (A CORREÇÃO) ---
          // Após a roleta ser redesenhada (com um item a menos),
          // resetamos a rotação do wrapper para 0.
          // Como a transição está 'none' (definida no fim do giro), 
          // isto é instantâneo e invisível.
          // A roleta redesenhada agora está visualmente a 0 graus, pronta para o próximo giro.
          rotation = 0; // Reseta a variável de estado
          // wheelWrapper pode ser nulo se não houver perguntas
          if (wheelWrapper) {
            wheelWrapper.style.transform = 'rotate(0deg)'; // Reseta o CSS
          }
          // --- FIM DA ADIÇÃO ---
          // Nota: updateRaceProgress() agora é chamado apenas quando o usuário clica em "Acertou"
        }
        // --- FIM DA LÓGICA DE FECHAR ---

        // Atualiza a pergunta selecionada (seja para null ou um objeto)
        selectedQuestion = question; 
        
        if (question && question.pergunta) {
          // SEMPRE mostra o modal quando há uma pergunta válida, independente do jogo selecionado
          // O jogo de pares pode ter sua própria lógica, mas o modal da pergunta deve aparecer sempre
          
          // Garante que os valores sejam definidos corretamente
          modalQuestionNum.textContent = `#${question.num || '?'}`;
          modalQuestionText.textContent = question.pergunta || 'Pergunta não encontrada';
          
          // Remove a classe hidden PRIMEIRO
          modalContainer.classList.remove('hidden');
          
          // Aguarda um frame para garantir que a classe foi removida antes de aplicar estilos
          requestAnimationFrame(() => {
            // Garante que o modal seja visível usando múltiplos métodos com !important
            modalContainer.style.setProperty('display', 'flex', 'important');
            modalContainer.style.setProperty('visibility', 'visible', 'important');
            modalContainer.style.setProperty('opacity', '1', 'important');
            modalContainer.style.setProperty('z-index', '9999', 'important');
            modalContainer.style.setProperty('position', 'fixed', 'important');
            
            // CORREÇÃO: Usa a referência do 'id' para adicionar a classe de animação
            if (modalContentDiv) {
              modalContentDiv.classList.add('modal-content');
            }
          });
        } else {
          // Lógica para FECHAR o modal (visualmente)
          modalContainer.classList.add('hidden');
          // Remove os estilos inline para permitir que a classe hidden funcione corretamente
          modalContainer.style.display = '';
          modalContainer.style.visibility = '';
          modalContainer.style.opacity = '';
          modalContainer.style.zIndex = '';
          
          // CORREÇÃO: Usa a referência do 'id' para remover a classe de animação
          if (modalContentDiv) {
            modalContentDiv.classList.remove('modal-content');
          }
        }
      }

      // --- Funções de Compartilhamento ---
      
      /**
       * Gera um ID único para a sessão do jogo
       */
      function generateGameSessionId() {
        return 'game_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      }
      
      /**
       * Salva o estado atual do jogo no localStorage e no serviço de compartilhamento
       */
      async function saveGameState() {
        if (!gameSessionId) return;
        
        const gameState = {
          perguntas: perguntas,
          textoPerguntas: textoPerguntas,
          currentGame: currentGame,
          battleModeEnabled: battleModeEnabled,
          raceScoreCount: raceScoreCount,
          raceProgressPercent: raceProgressPercent,
          totalPerguntasIniciais: totalPerguntasIniciais,
          forceErrorCount: forceErrorCount,
          forceErrorCount1: forceErrorCount1,
          forceErrorCount2: forceErrorCount2,
          raceScoreCount1: raceScoreCount1,
          raceScoreCount2: raceScoreCount2,
          raceErrosCount1: raceErrosCount1,
          raceErrosCount2: raceErrosCount2,
          raceProgressPercent1: raceProgressPercent1,
          raceProgressPercent2: raceProgressPercent2,
          currentPlayer: currentPlayer,
          perguntasJogador1: perguntasJogador1,
          perguntasJogador2: perguntasJogador2,
          wordSecret: wordSecret,
          wordDiscovered: wordDiscovered,
          wordTriedLetters: wordTriedLetters,
          wordScore: wordScore,
          wordScore1: wordScore1,
          wordScore2: wordScore2,
          wordList: wordList,
          wordListIndex: wordListIndex,
          lastUpdate: Date.now()
        };
        
        // Salva no localStorage (para sincronização local)
        localStorage.setItem('gameState_' + gameSessionId, JSON.stringify(gameState));
        
        // Nota: A sincronização entre diferentes computadores/redes funciona através da URL codificada
        // O localStorage é usado apenas para cache local e sincronização quando ambos estão no mesmo navegador
      }
      
      /**
       * Carrega o estado do jogo do localStorage ou do serviço de compartilhamento
       */
      async function loadGameState() {
        if (!gameSessionId) return false;
        
        let gameState = null;
        
        // Tenta carregar do localStorage primeiro (cache local, mais rápido)
        const savedState = localStorage.getItem('gameState_' + gameSessionId);
        if (savedState) {
          try {
            const parsed = JSON.parse(savedState);
            // Verifica se o estado não está muito antigo (mais de 5 minutos)
            const stateAge = Date.now() - (parsed.lastUpdate || 0);
            if (stateAge < 300000) { // 5 minutos
              gameState = parsed;
            }
          } catch (e) {
            // Ignora erro de parse
          }
        }
        
        // Se não encontrou no localStorage ou está antigo, tenta do serviço online (se disponível)
        // Nota: O serviço online está desabilitado por enquanto, usando apenas URL codificada
        // Isso funciona entre diferentes computadores/redes através da URL
        
        if (!gameState) return false;
        
        try {
          
          // Restaura todas as variáveis
          perguntas = gameState.perguntas || [];
          textoPerguntas = gameState.textoPerguntas || textoInicial;
          currentGame = gameState.currentGame || null;
          battleModeEnabled = gameState.battleModeEnabled || false;
          raceScoreCount = gameState.raceScoreCount || 0;
          raceProgressPercent = gameState.raceProgressPercent || 0;
          totalPerguntasIniciais = gameState.totalPerguntasIniciais || 0;
          forceErrorCount = gameState.forceErrorCount || 0;
          forceErrorCount1 = gameState.forceErrorCount1 || 0;
          forceErrorCount2 = gameState.forceErrorCount2 || 0;
          raceScoreCount1 = gameState.raceScoreCount1 || 0;
          raceScoreCount2 = gameState.raceScoreCount2 || 0;
          raceErrosCount1 = gameState.raceErrosCount1 || 0;
          raceErrosCount2 = gameState.raceErrosCount2 || 0;
          raceProgressPercent1 = gameState.raceProgressPercent1 || 0;
          raceProgressPercent2 = gameState.raceProgressPercent2 || 0;
          currentPlayer = gameState.currentPlayer || 1;
          perguntasJogador1 = gameState.perguntasJogador1 || [];
          perguntasJogador2 = gameState.perguntasJogador2 || [];
          wordSecret = gameState.wordSecret || '';
          wordDiscovered = gameState.wordDiscovered || [];
          wordTriedLetters = gameState.wordTriedLetters || [];
          wordScore = gameState.wordScore || 0;
          wordScore1 = gameState.wordScore1 || 0;
          wordScore2 = gameState.wordScore2 || 0;
          wordList = gameState.wordList || [];
          wordListIndex = gameState.wordListIndex || 0;
          
          // Atualiza a UI
          questionsTextarea.value = textoPerguntas;
          updateQuestionsCount();
          renderWheel();
          updateUI();
          
          // Atualiza o toggle do battle mode
          if (battleModeToggle) {
            battleModeToggle.checked = battleModeEnabled;
          }
          
          // Atualiza os jogos se necessário
          if (currentGame === 'race') {
            if (battleModeEnabled) {
              updateBattleCarPositions();
            } else {
              updateRaceCarPosition();
            }
          }
          
          return true;
        } catch (e) {
          console.error('Erro ao carregar estado do jogo:', e);
          return false;
        }
      }
      
      /**
       * Cria um bin no serviço de compartilhamento online (opcional)
       * Se falhar, o sistema ainda funciona com dados codificados na URL
       */
      async function createOnlineBin() {
        if (jsonBinId) return jsonBinId; // Já existe
        
        // Tenta usar um serviço público de compartilhamento de dados
        // Se falhar, o sistema ainda funciona com dados na URL
        try {
          // Usa um serviço de pastebin público ou similar
          // Por enquanto, retorna null e usa apenas URL codificada
          // Isso garante que funcione mesmo sem serviço online
          return null;
        } catch (e) {
          console.error('Erro ao criar bin online:', e);
          return null;
        }
      }
      
      /**
       * Cria um link compartilhável para o jogo
       */
      async function createShareableLink() {
        if (!gameSessionId) {
          // Cria uma nova sessão se não existir
          gameSessionId = generateGameSessionId();
          isHost = true;
          await saveGameState();
        }
        
        // Cria um bin online para sincronização entre dispositivos
        if (isHost && !jsonBinId) {
          await createOnlineBin();
        }
        
        const currentUrl = window.location.origin + window.location.pathname;
        
        // Codifica TODOS os dados do jogo na URL para funcionar entre diferentes computadores/redes
        const gameData = {
          perguntas: perguntas.map(p => p.pergunta),
          textoPerguntas: textoPerguntas,
          currentGame: currentGame,
          battleModeEnabled: battleModeEnabled,
          raceScoreCount: raceScoreCount,
          raceProgressPercent: raceProgressPercent,
          totalPerguntasIniciais: totalPerguntasIniciais,
          forceErrorCount: forceErrorCount,
          forceErrorCount1: forceErrorCount1,
          forceErrorCount2: forceErrorCount2,
          raceScoreCount1: raceScoreCount1,
          raceScoreCount2: raceScoreCount2,
          raceErrosCount1: raceErrosCount1,
          raceErrosCount2: raceErrosCount2,
          raceProgressPercent1: raceProgressPercent1,
          raceProgressPercent2: raceProgressPercent2,
          currentPlayer: currentPlayer,
          perguntasJogador1: perguntasJogador1.map(p => p.pergunta),
          perguntasJogador2: perguntasJogador2.map(p => p.pergunta),
          wordSecret: wordSecret,
          wordDiscovered: wordDiscovered,
          wordTriedLetters: wordTriedLetters,
          wordScore: wordScore,
          wordScore1: wordScore1,
          wordScore2: wordScore2,
          wordList: wordList,
          wordListIndex: wordListIndex,
          binId: jsonBinId // Inclui o ID do bin online se disponível
        };
        
        try {
          // Usa compressão simples para reduzir o tamanho da URL
          const jsonString = JSON.stringify(gameData);
          const encodedData = btoa(jsonString);
          
          // Se a URL ficar muito longa, divide em partes
          const maxUrlLength = 2000; // Limite seguro para URLs
          if (encodedData.length > maxUrlLength) {
            // Se muito grande, codifica apenas dados essenciais
            const essentialData = {
              perguntas: perguntas.map(p => p.pergunta),
              currentGame: currentGame,
              battleModeEnabled: battleModeEnabled,
              binId: jsonBinId
            };
            const essentialEncoded = btoa(JSON.stringify(essentialData));
            // Codifica os parâmetros da URL para evitar problemas com caracteres especiais
            return currentUrl + '?game=' + encodeURIComponent(gameSessionId) + '&data=' + encodeURIComponent(essentialEncoded) + (jsonBinId ? '&bin=' + encodeURIComponent(jsonBinId) : '');
          }
          
          // Codifica os parâmetros da URL para evitar problemas com caracteres especiais
          let shareUrl = currentUrl + '?game=' + encodeURIComponent(gameSessionId) + '&data=' + encodeURIComponent(encodedData);
          if (jsonBinId) {
            shareUrl += '&bin=' + encodeURIComponent(jsonBinId);
          }
          return shareUrl;
        } catch (e) {
          // Se falhar ao codificar, retorna URL simples com dados mínimos
          const minimalData = {
            perguntas: perguntas.map(p => p.pergunta),
            currentGame: currentGame,
            battleModeEnabled: battleModeEnabled
          };
          try {
            const minimalEncoded = btoa(JSON.stringify(minimalData));
            // Codifica os parâmetros da URL para evitar problemas com caracteres especiais
            return currentUrl + '?game=' + encodeURIComponent(gameSessionId) + '&data=' + encodeURIComponent(minimalEncoded);
          } catch (e2) {
            return currentUrl + '?game=' + encodeURIComponent(gameSessionId);
          }
        }
      }
      
      /**
       * Atualiza a URL com o estado atual do jogo (para sincronização entre diferentes computadores/redes)
       */
      function updateUrlWithState() {
        if (!isHost || !gameSessionId) return;
        
        // Atualiza a URL com o estado atual sem recarregar a página
        const currentUrl = window.location.origin + window.location.pathname;
        const gameData = {
          perguntas: perguntas.map(p => p.pergunta),
          textoPerguntas: textoPerguntas,
          currentGame: currentGame,
          battleModeEnabled: battleModeEnabled,
          raceScoreCount: raceScoreCount,
          raceProgressPercent: raceProgressPercent,
          totalPerguntasIniciais: totalPerguntasIniciais,
          forceErrorCount: forceErrorCount,
          forceErrorCount1: forceErrorCount1,
          forceErrorCount2: forceErrorCount2,
          raceScoreCount1: raceScoreCount1,
          raceScoreCount2: raceScoreCount2,
          raceErrosCount1: raceErrosCount1,
          raceErrosCount2: raceErrosCount2,
          raceProgressPercent1: raceProgressPercent1,
          raceProgressPercent2: raceProgressPercent2,
          currentPlayer: currentPlayer,
          perguntasJogador1: perguntasJogador1.map(p => p.pergunta),
          perguntasJogador2: perguntasJogador2.map(p => p.pergunta),
          wordSecret: wordSecret,
          wordDiscovered: wordDiscovered,
          wordTriedLetters: wordTriedLetters,
          wordScore: wordScore,
          wordScore1: wordScore1,
          wordScore2: wordScore2,
          wordList: wordList,
          wordListIndex: wordListIndex
        };
        
        try {
          const encodedData = btoa(JSON.stringify(gameData));
          const maxUrlLength = 2000;
          if (encodedData.length <= maxUrlLength) {
            // Codifica os parâmetros da URL para evitar problemas com caracteres especiais
            const newUrl = currentUrl + '?game=' + encodeURIComponent(gameSessionId) + '&data=' + encodeURIComponent(encodedData) + (jsonBinId ? '&bin=' + encodeURIComponent(jsonBinId) : '');
            window.history.replaceState({}, document.title, newUrl);
          }
        } catch (e) {
          // Ignora erro de atualização de URL
        }
      }
      
      /**
       * Inicia a sincronização do estado do jogo
       */
      function startGameSync() {
        if (syncInterval) {
          clearInterval(syncInterval);
        }
        
        // Sincroniza a cada 2 segundos
        syncInterval = setInterval(async () => {
          if (isHost) {
            // Host salva o estado e atualiza a URL
            await saveGameState();
            updateUrlWithState(); // Atualiza URL para que outros possam acessar o estado atual
          } else {
            // Cliente sempre recarrega da URL para pegar o estado mais recente do host
            // Isso funciona entre diferentes computadores e redes
            const urlParams = new URLSearchParams(window.location.search);
            let urlData = urlParams.get('data');
            
            // Se não há dados na URL, tenta do localStorage
            if (!urlData) {
              const loaded = await loadGameState();
              if (loaded) {
                // Se carregou do localStorage, atualiza a URL com esses dados
                updateUrlWithState();
                return;
              }
            }
            
            // Se há dados na URL, recarrega deles
            if (urlData) {
              await loadInitialStateFromUrl(urlData);
            }
          }
        }, 2000);
      }
      
      /**
       * Para a sincronização do estado do jogo
       */
      function stopGameSync() {
        if (syncInterval) {
          clearInterval(syncInterval);
          syncInterval = null;
        }
      }
      
      /**
       * Carrega o estado inicial da URL (quando não há localStorage)
       */
      async function loadInitialStateFromUrl(urlData) {
        try {
          if (!urlData || urlData.trim() === '') {
            console.error('URL data está vazio');
            return false;
          }
          
          // Decodifica os dados da URL
          // Nota: urlData pode já estar decodificado pelo URLSearchParams.get()
          let gameData;
          try {
            // Tenta decodificar Base64 diretamente primeiro (caso já esteja decodificado do URI)
            gameData = JSON.parse(atob(urlData));
          } catch (decodeError) {
            // Se falhar, tenta decodificar URI primeiro (caso ainda esteja codificado)
            try {
              const decodedData = decodeURIComponent(urlData);
              gameData = JSON.parse(atob(decodedData));
            } catch (e2) {
              console.error('Erro ao decodificar URL:', decodeError, e2);
              return false;
            }
          }
          
          if (!gameData || typeof gameData !== 'object') {
            console.error('Dados decodificados inválidos');
            return false;
          }
          
          let loaded = false;
          
          // Restaura as perguntas (obrigatório para o jogo funcionar)
          if (gameData.perguntas && Array.isArray(gameData.perguntas) && gameData.perguntas.length > 0) {
            perguntas = gameData.perguntas.map((p, i) => ({ num: i + 1, pergunta: p }));
            textoPerguntas = gameData.textoPerguntas || gameData.perguntas.join('\n');
            if (questionsTextarea) {
              questionsTextarea.value = textoPerguntas;
            }
            updateQuestionsCount();
            renderWheel();
            updateUI();
            loaded = true;
          }
          
          // Restaura configurações do jogo
          if (gameData.currentGame) {
            currentGame = gameData.currentGame;
            loaded = true;
          }
          
          if (gameData.battleModeEnabled !== undefined) {
            battleModeEnabled = gameData.battleModeEnabled;
            if (battleModeToggle) {
              battleModeToggle.checked = battleModeEnabled;
            }
            loaded = true;
          }
          
          // Restaura estado dos jogos se disponível
          if (gameData.raceScoreCount !== undefined) { raceScoreCount = gameData.raceScoreCount; loaded = true; }
          if (gameData.raceProgressPercent !== undefined) { raceProgressPercent = gameData.raceProgressPercent; loaded = true; }
          if (gameData.totalPerguntasIniciais !== undefined) { totalPerguntasIniciais = gameData.totalPerguntasIniciais; loaded = true; }
          if (gameData.forceErrorCount !== undefined) { forceErrorCount = gameData.forceErrorCount; loaded = true; }
          if (gameData.forceErrorCount1 !== undefined) { forceErrorCount1 = gameData.forceErrorCount1; loaded = true; }
          if (gameData.forceErrorCount2 !== undefined) { forceErrorCount2 = gameData.forceErrorCount2; loaded = true; }
          if (gameData.raceScoreCount1 !== undefined) { raceScoreCount1 = gameData.raceScoreCount1; loaded = true; }
          if (gameData.raceScoreCount2 !== undefined) { raceScoreCount2 = gameData.raceScoreCount2; loaded = true; }
          if (gameData.raceErrosCount1 !== undefined) { raceErrosCount1 = gameData.raceErrosCount1; loaded = true; }
          if (gameData.raceErrosCount2 !== undefined) { raceErrosCount2 = gameData.raceErrosCount2; loaded = true; }
          if (gameData.raceProgressPercent1 !== undefined) { raceProgressPercent1 = gameData.raceProgressPercent1; loaded = true; }
          if (gameData.raceProgressPercent2 !== undefined) { raceProgressPercent2 = gameData.raceProgressPercent2; loaded = true; }
          if (gameData.currentPlayer !== undefined) { currentPlayer = gameData.currentPlayer; loaded = true; }
          if (gameData.perguntasJogador1 && Array.isArray(gameData.perguntasJogador1)) {
            perguntasJogador1 = gameData.perguntasJogador1.map((p, i) => ({ num: i + 1, pergunta: p }));
            loaded = true;
          }
          if (gameData.perguntasJogador2 && Array.isArray(gameData.perguntasJogador2)) {
            perguntasJogador2 = gameData.perguntasJogador2.map((p, i) => ({ num: i + 1, pergunta: p }));
            loaded = true;
          }
          if (gameData.wordSecret) { wordSecret = gameData.wordSecret; loaded = true; }
          if (gameData.wordDiscovered) { wordDiscovered = gameData.wordDiscovered; loaded = true; }
          if (gameData.wordTriedLetters) { wordTriedLetters = gameData.wordTriedLetters; loaded = true; }
          if (gameData.wordScore !== undefined) { wordScore = gameData.wordScore; loaded = true; }
          if (gameData.wordScore1 !== undefined) { wordScore1 = gameData.wordScore1; loaded = true; }
          if (gameData.wordScore2 !== undefined) { wordScore2 = gameData.wordScore2; loaded = true; }
          if (gameData.wordList) { wordList = gameData.wordList; loaded = true; }
          if (gameData.wordListIndex !== undefined) { wordListIndex = gameData.wordListIndex; loaded = true; }
          
          // Se há binId na URL, usa para sincronização online (opcional)
          if (gameData.binId) {
            jsonBinId = gameData.binId;
            loaded = true;
          }
          
          // Atualiza UI dos jogos se necessário
          if (currentGame === 'race') {
            if (battleModeEnabled) {
              updateBattleCarPositions();
            } else {
              updateRaceCarPosition();
            }
          }
          
          // Se carregou algum dado, salva no localStorage para sincronização
          if (loaded) {
            await saveGameState();
            return true;
          }
          
          // Se não carregou nada, retorna false
          return false;
        } catch (e) {
          console.error('Erro ao carregar dados da URL:', e);
          return false;
        }
      }
      
      /**
       * Verifica se há um parâmetro de jogo na URL e carrega o estado
       */
      async function checkUrlForGame() {
        try {
          const urlParams = new URLSearchParams(window.location.search);
          const gameId = urlParams.get('game');
          let urlData = urlParams.get('data');
          const binId = urlParams.get('bin');
          
          if (gameId) {
            gameSessionId = gameId;
            isHost = false; // Quem entra pelo link não é o host
            
            // Se há binId na URL, usa para sincronização online
            if (binId) {
              jsonBinId = binId;
            }
            
            // Se não há urlData na query string, tenta pegar diretamente da URL
            // Nota: URLSearchParams.get() já decodifica automaticamente
            if (!urlData) {
              const fullUrl = window.location.href;
              const dataMatch = fullUrl.match(/[?&]data=([^&]+)/);
              if (dataMatch) {
                try {
                  // Se pegamos via regex, precisamos decodificar manualmente
                  urlData = decodeURIComponent(dataMatch[1]);
                } catch (e) {
                  // Se falhar, usa o valor original
                  urlData = dataMatch[1];
                }
              }
            }
            
            // Tenta carregar do localStorage primeiro (se já acessou antes no mesmo navegador)
            const loadedFromStorage = await loadGameState();
            
            if (loadedFromStorage) {
              customAlert('Você entrou no jogo compartilhado! O estado será sincronizado automaticamente.', 'Jogo Compartilhado');
              startGameSync();
              return;
            }
            
            // Se não encontrou no localStorage, carrega da URL (funciona entre diferentes computadores/redes)
            if (urlData) {
              const loadedFromUrl = await loadInitialStateFromUrl(urlData);
              
              if (loadedFromUrl) {
                customAlert('Você entrou no jogo compartilhado! O estado será sincronizado automaticamente.', 'Jogo Compartilhado');
                startGameSync();
                return;
              } else {
                console.error('Falha ao carregar dados da URL. urlData:', urlData ? urlData.substring(0, 100) + '...' : 'vazio');
              }
            }
            
            // Se chegou aqui, não conseguiu carregar
            customAlert('Não foi possível carregar o jogo compartilhado. Verifique se o link está correto e completo.', 'Erro');
            window.history.replaceState({}, document.title, window.location.pathname);
            gameSessionId = null;
            isHost = null;
          }
        } catch (e) {
          console.error('Erro ao verificar URL do jogo:', e);
          customAlert('Erro ao carregar o jogo compartilhado. Tente novamente.', 'Erro');
        }
      }
      
      /**
       * Mostra o modal de compartilhamento
       */
      async function showShareModal() {
        const shareUrl = await createShareableLink();
        shareLinkInput.value = shareUrl;
        shareModal.classList.remove('hidden');
        
        // Inicia a sincronização se ainda não estiver ativa
        if (!syncInterval) {
          startGameSync();
        }
      }
      
      /**
       * Fecha o modal de compartilhamento
       */
      function closeShareModal() {
        shareModal.classList.add('hidden');
      }

      // --- Funções de Animação de Vitória ---
      
      /**
       * Cria e anima balões subindo
       */
      function createBalloons() {
        const container = document.getElementById('victory-effects');
        const colors = ['#FF6B9D', '#C44569', '#FFA07A', '#FFD700', '#FF6347', '#9370DB', '#00CED1', '#FF1493'];
        const balloonCount = 20;
        
        for (let i = 0; i < balloonCount; i++) {
          const balloon = document.createElement('div');
          balloon.className = 'balloon';
          
          // Posição aleatória na parte inferior da tela
          const startX = Math.random() * 100;
          const driftX = (Math.random() - 0.5) * 100;
          const driftRot = (Math.random() - 0.5) * 20;
          
          balloon.style.left = startX + '%';
          balloon.style.bottom = '-100px';
          balloon.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
          balloon.style.setProperty('--drift-x', driftX + 'px');
          balloon.style.setProperty('--drift-rot', driftRot + 'deg');
          balloon.style.animationDelay = (Math.random() * 2) + 's';
          
          container.appendChild(balloon);
          
          // Remove após a animação
          setTimeout(() => {
            if (balloon.parentNode) {
              balloon.parentNode.removeChild(balloon);
            }
          }, 10000);
        }
      }
      
      /**
       * Cria e anima fogos de artifício
       */
      function createFireworks() {
        const container = document.getElementById('victory-effects');
        const fireworkCount = 3;
        
        for (let i = 0; i < fireworkCount; i++) {
          const firework = document.createElement('div');
          firework.className = 'firework';
          firework.style.left = (20 + i * 30) + '%';
          firework.style.top = '50%';
          
          container.appendChild(firework);
          
          // Remove após a animação
          setTimeout(() => {
            if (firework.parentNode) {
              firework.parentNode.removeChild(firework);
            }
          }, 2000);
        }
      }
      
      /**
       * Cria e anima confetes caindo
       */
      function createConfetti() {
        const container = document.getElementById('victory-effects');
        const colors = ['#FF6B9D', '#C44569', '#FFA07A', '#FFD700', '#FF6347', '#9370DB', '#00CED1', '#FF1493', '#32CD32', '#FF4500'];
        const confettiCount = 100;
        
        for (let i = 0; i < confettiCount; i++) {
          const confetti = document.createElement('div');
          confetti.className = 'confetti';
          
          const startX = Math.random() * 100;
          const delay = Math.random() * 2;
          const duration = 2 + Math.random() * 2;
          const color = colors[Math.floor(Math.random() * colors.length)];
          
          confetti.style.left = startX + '%';
          confetti.style.top = '-10px';
          confetti.style.setProperty('--confetti-color', color);
          confetti.style.animationDelay = delay + 's';
          confetti.style.animationDuration = duration + 's';
          
          container.appendChild(confetti);
          
          // Remove após a animação
          setTimeout(() => {
            if (confetti.parentNode) {
              confetti.parentNode.removeChild(confetti);
            }
          }, (delay + duration) * 1000);
        }
      }
      
      /**
       * Cria o texto animado de vitória
       */
      function createVictoryText() {
        const container = document.getElementById('victory-effects');
        
        const victoryText = document.createElement('div');
        victoryText.className = 'victory-text';
        victoryText.textContent = 'Parabéns pela vitória!';
        
        container.appendChild(victoryText);
        
        // Remove após 5 segundos
        setTimeout(() => {
          if (victoryText.parentNode) {
            victoryText.style.transition = 'opacity 0.5s ease-out';
            victoryText.style.opacity = '0';
            setTimeout(() => {
              if (victoryText.parentNode) {
                victoryText.parentNode.removeChild(victoryText);
              }
            }, 500);
          }
        }, 5000);
      }
      
      /**
       * Dispara todas as animações de vitória
       * Retorna uma Promise que resolve após a animação terminar
       */
      function triggerVictoryAnimation() {
        // Limpa qualquer animação anterior
        const container = document.getElementById('victory-effects');
        container.innerHTML = '';
        
        // Cria os efeitos
        createVictoryText();
        createBalloons();
        createFireworks();
        createConfetti();
        
        // Retorna uma Promise que resolve após 5 segundos (duração da animação)
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 5000);
        });
      }

      /**
       * Cria o texto animado de derrota
       */
      function createDefeatText() {
        const container = document.getElementById('victory-effects');
        
        const defeatText = document.createElement('div');
        defeatText.className = 'defeat-text';
        defeatText.textContent = 'Game Over';
        
        container.appendChild(defeatText);
        
        // Remove após 4 segundos
        setTimeout(() => {
          if (defeatText.parentNode) {
            defeatText.style.transition = 'opacity 0.5s ease-out';
            defeatText.style.opacity = '0';
            setTimeout(() => {
              if (defeatText.parentNode) {
                defeatText.parentNode.removeChild(defeatText);
              }
            }, 500);
          }
        }, 4000);
      }

      /**
       * Cria overlay escuro para derrota
       */
      function createDefeatOverlay() {
        const container = document.getElementById('victory-effects');
        
        const overlay = document.createElement('div');
        overlay.className = 'defeat-overlay';
        
        container.appendChild(overlay);
        
        // Remove após 4 segundos
        setTimeout(() => {
          if (overlay.parentNode) {
            overlay.style.transition = 'opacity 0.5s ease-out';
            overlay.style.opacity = '0';
            setTimeout(() => {
              if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
              }
            }, 500);
          }
        }, 4000);
      }

      /**
       * Cria efeito de raio/lightning para derrota
       */
      function createDefeatLightning() {
        const container = document.getElementById('victory-effects');
        
        const lightning = document.createElement('div');
        lightning.className = 'defeat-lightning';
        
        container.appendChild(lightning);
        
        // Remove após 4 segundos
        setTimeout(() => {
          if (lightning.parentNode) {
            lightning.style.transition = 'opacity 0.5s ease-out';
            lightning.style.opacity = '0';
            setTimeout(() => {
              if (lightning.parentNode) {
                lightning.parentNode.removeChild(lightning);
              }
            }, 500);
          }
        }, 4000);
      }

      /**
       * Dispara todas as animações de derrota
       * Retorna uma Promise que resolve após a animação terminar
       */
      function triggerDefeatAnimation() {
        // Limpa qualquer animação anterior
        const container = document.getElementById('victory-effects');
        container.innerHTML = '';
        
        // Cria os efeitos de derrota
        createDefeatOverlay();
        createDefeatLightning();
        createDefeatText();
        
        // Retorna uma Promise que resolve após 4 segundos (duração da animação)
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 4000);
        });
      }

      // --- Event Handlers ---

      // Girar a Roleta
      spinBtn.addEventListener('click', () => {
        if (spinning || perguntas.length === 0) return;

        spinning = true;
        spinBtn.disabled = true;
        spinBtn.textContent = 'Girar';
        
        // Esconde o modal se estiver aberto (não deve acontecer, mas por segurança)
        // Esta chamada é segura, pois selectedQuestion será null ou o reset não ocorrerá
        showModal(null); 
        
        // Fecha o menu lateral se estiver aberto
        if (sidebarOpen) {
          closeSidebar();
        }
        
        // No modo Battle, cada jogador só recebe perguntas do seu próprio conjunto
        let perguntasAtuais = [];
        if (battleModeEnabled && currentGame) {
          // Verifica se há perguntas disponíveis para qualquer jogador
          const perguntasJ1Disponiveis = perguntas.filter(p => 
            perguntasJogador1.some(pj => pj.num === p.num)
          );
          const perguntasJ2Disponiveis = perguntas.filter(p => 
            perguntasJogador2.some(pj => pj.num === p.num)
          );
          
          // Seleciona apenas das perguntas do jogador atual que ainda estão disponíveis
          const perguntasJogadorAtual = currentPlayer === 1 ? perguntasJogador1 : perguntasJogador2;
          perguntasAtuais = currentPlayer === 1 ? perguntasJ1Disponiveis : perguntasJ2Disponiveis;
          
          // Se não há perguntas disponíveis para este jogador, alterna para o outro jogador
          if (perguntasAtuais.length === 0) {
            // Alterna o jogador e tenta novamente
            currentPlayer = currentPlayer === 1 ? 2 : 1;
            perguntasAtuais = currentPlayer === 1 ? perguntasJ1Disponiveis : perguntasJ2Disponiveis;
            
            // Atualiza o display do jogador atual
            if (currentPlayerDisplay) {
              if (currentPlayer === 1) {
                currentPlayerDisplay.textContent = 'Jogador 1';
                currentPlayerDisplay.className = 'font-bold text-red-600';
              } else {
                currentPlayerDisplay.textContent = 'Jogador 2';
                currentPlayerDisplay.className = 'font-bold text-blue-600';
              }
            }
            
            // Se nenhum jogador tem perguntas disponíveis, verifica se o jogo terminou
            if (perguntasAtuais.length === 0) {
              // Verifica se ainda há perguntas na roleta principal
              if (perguntas.length > 0) {
                // Há perguntas na roleta mas não estão nos conjuntos dos jogadores
                // Isso pode indicar uma dessincronização - tenta sincronizar os arrays
                // Atualiza os arrays dos jogadores para incluir apenas perguntas que ainda existem
                perguntasJogador1 = perguntasJogador1.filter(pj => 
                  perguntas.some(p => p.num === pj.num)
                );
                perguntasJogador2 = perguntasJogador2.filter(pj => 
                  perguntas.some(p => p.num === pj.num)
                );
                
                // Tenta novamente após sincronizar
                const perguntasJ1Sync = perguntas.filter(p => 
                  perguntasJogador1.some(pj => pj.num === p.num)
                );
                const perguntasJ2Sync = perguntas.filter(p => 
                  perguntasJogador2.some(pj => pj.num === p.num)
                );
                
                perguntasAtuais = currentPlayer === 1 ? perguntasJ1Sync : perguntasJ2Sync;
                
                // Se ainda não há perguntas disponíveis após sincronizar, termina o jogo
                if (perguntasAtuais.length === 0) {
                  checkBattleEndGame();
                  spinning = false;
                  spinBtn.disabled = false;
                  return;
                }
              } else {
                // Não há mais perguntas na roleta - termina o jogo
                checkBattleEndGame();
                spinning = false;
                spinBtn.disabled = false;
                return;
              }
            }
          }
        } else {
          perguntasAtuais = [...perguntas];
        }
        
        const indiceEscolhido = Math.floor(Math.random() * perguntasAtuais.length);
        
        const setorAngulo = 360 / perguntas.length; // Usa o total de perguntas para calcular os setores
        // Precisa encontrar o índice real da pergunta no array completo de perguntas
        const perguntaEscolhida = perguntasAtuais[indiceEscolhido];
        const indiceReal = perguntas.findIndex(p => p.num === perguntaEscolhida.num);
        
        // Ângulo alvo é o meio do setor escolhido
        const anguloAlvo = indiceReal * setorAngulo + (setorAngulo / 2);
        const voltas = 5 + Math.random() * 3;
        // A rotação final é calculada para que o anguloAlvo pare no topo (indicado pela seta)
        // O '-' é porque a rotação positiva é no sentido horário
        // Esta é uma rotação ABSOLUTA (calculada a partir de 0)
        const rotacaoTotal = (voltas * 360) - anguloAlvo;

        // Armazena a nova rotação
        rotation = rotacaoTotal;
        
        // Aplica a transição e a rotação
        if (wheelWrapper) { // Verificação de segurança
          wheelWrapper.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
          wheelWrapper.style.transform = `rotate(${rotation}deg)`;
        }

        // Após a animação terminar
        setTimeout(() => {
            // Determina qual setor ficou no topo usando a rotação final
            // Normaliza a rotação para [0, 360)
            const rotacaoNormalizada = ((rotation % 360) + 360) % 360;

            // Calcula o ângulo do centro de cada setor e encontra o mais próximo do topo (0º)
            let indiceFinal = 0;
            let menorDist = Infinity;
            for (let i = 0; i < perguntas.length; i++) {
              const anguloMeio = (setorAngulo * i) + (setorAngulo / 2);
              // Após rotacionar a roda, o ângulo relativo ao topo será (anguloMeio + rotacao) % 360
              const angTopo = (anguloMeio + rotacaoNormalizada) % 360;
              const dist = Math.min(Math.abs(angTopo), Math.abs(360 - angTopo));
              if (dist < menorDist) {
                menorDist = dist;
                indiceFinal = i;
              }
            }

            // No modo Battle, verifica se a pergunta selecionada pertence ao jogador atual
            let perguntaSelecionada = perguntas[indiceFinal];
            if (battleModeEnabled && currentGame) {
              const perguntasJogadorAtual = currentPlayer === 1 ? perguntasJogador1 : perguntasJogador2;
              const perguntaPertenceAoJogador = perguntasJogadorAtual.some(pj => pj.num === perguntaSelecionada.num);
              
              // Se a pergunta não pertence ao jogador, busca a próxima pergunta válida
              if (!perguntaPertenceAoJogador) {
                const perguntasValidas = perguntas.filter(p => 
                  perguntasJogadorAtual.some(pj => pj.num === p.num)
                );
                if (perguntasValidas.length > 0) {
                  perguntaSelecionada = perguntasValidas[Math.floor(Math.random() * perguntasValidas.length)];
                }
              }
            }

            // Verifica se há uma pergunta válida antes de mostrar o modal
            if (!perguntaSelecionada || !perguntaSelecionada.pergunta) {
              spinning = false;
              spinBtn.disabled = false;
              spinBtn.textContent = 'Girar';
              if (wheelWrapper) {
                wheelWrapper.style.transition = 'none';
              }
              return;
            }

            spinning = false;
            spinBtn.disabled = false;
            spinBtn.textContent = 'Girar';

            // Remove a transição *antes* de qualquer outra coisa
            // Isto é crucial para o reset em showModal(null) ser instantâneo
            if (wheelWrapper) { // Verificação de segurança
              wheelWrapper.style.transition = 'none';
            }

            // Mostra o modal com a pergunta selecionada
            showModal(perguntaSelecionada);

        }, 4000);
      });

      // Reiniciar a Roleta
      restartBtn.addEventListener('click', () => {
        textoPerguntas = textoInicial;
        questionsTextarea.value = textoInicial;
        rotation = 0;
        
        if (wheelWrapper) { // Verificação de segurança
          wheelWrapper.style.transition = 'none'; // Sem animação
          wheelWrapper.style.transform = `rotate(0deg)`;
        }
        
        showModal(null);
        updatePerguntas(); // Re-renderiza a roleta e a UI
      });

      // --- Funções do Menu Lateral ---
      function openSidebar() {
        sidebarOpen = true;
        sidebar.classList.remove('closed');
        sidebar.classList.add('open');
        sidebarOverlay.classList.remove('hidden');
      }

      function closeSidebar() {
        sidebarOpen = false;
        sidebar.classList.remove('open');
        sidebar.classList.add('closed');
        sidebarOverlay.classList.add('hidden');
      }

      // Abrir/Fechar Menu Lateral
      toggleSidebarBtn.addEventListener('click', () => {
        if (sidebarOpen) {
          closeSidebar();
        } else {
          openSidebar();
        }
      });

      closeSidebarBtn.addEventListener('click', () => {
        closeSidebar();
      });

      // Fechar menu lateral ao clicar no overlay (fora do menu)
      sidebarOverlay.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeSidebar();
      });
      
      // Prevenir que cliques dentro do sidebar fechem o menu
      sidebar.addEventListener('click', (e) => {
        e.stopPropagation();
      });

      // Controlador de Zoom
      zoomInBtn.addEventListener('click', zoomIn);
      zoomOutBtn.addEventListener('click', zoomOut);

      // Reset zoom ao clicar duas vezes no indicador de nível
      zoomLevel.addEventListener('dblclick', resetZoom);

      // Aplicar zoom inicial
      applyZoom();

      // Atualizar perguntas ao digitar no textarea
      questionsTextarea.addEventListener('input', (e) => {
        textoPerguntas = e.target.value;
        updatePerguntas();
      });

      // Fechar o Modal - Acertou
      modalCorrectBtn.addEventListener('click', () => {
        
        // Jogo da Palavra Secreta - permite tentar uma letra após acertar
        if (currentGame === 'word') {
          if (battleModeEnabled) {
            // Modo Battle - incrementa acerto do jogador atual e permite tentar letra
            if (currentPlayer === 1) {
              wordScore1++;
              if (wordScore1Display) wordScore1Display.textContent = wordScore1;
            } else {
              wordScore2++;
              if (wordScore2Display) wordScore2Display.textContent = wordScore2;
            }
            wordCanTryLetter = true;
            enableWordLetterInput(true);
          } else {
            // Modo single player
            wordScore++;
            if (wordScoreDisplay) wordScoreDisplay.textContent = wordScore;
            wordCanTryLetter = true;
            enableWordLetterInput(false);
          }
        }
        
        // Jogo de Pares de Frases - no modo Battle também alterna jogador
        if (currentGame === 'pairs' && pairsGameStarted) {
          setPairsSelectionAvailability(true);
        }
        
        // Atualiza o progresso da corrida antes de fechar
        updateRaceProgress();
        showModal(null);
        
        // Salva o estado se houver sessão ativa
        if (gameSessionId) {
          (async () => { await saveGameState(); })();
        }
      });

      // Fechar o Modal - Errou
      modalWrongBtn.addEventListener('click', () => {
        // No modo Battle, sempre alterna o jogador após errar
        if (battleModeEnabled && currentGame) {
          // Alterna o jogador para a próxima rodada
          currentPlayer = currentPlayer === 1 ? 2 : 1;
          // Atualiza o display do jogador atual
          updateCurrentPlayerDisplay();
        }
        
        // Jogo da Forca - adiciona erro e atualiza o boneco
        if (currentGame === 'force') {
          if (battleModeEnabled) {
            // Modo Battle - conta erro para o jogador anterior (já alternamos acima)
            const erroPlayer = currentPlayer === 1 ? 2 : 1; // O jogador que errou é o oposto do atual
            if (erroPlayer === 1) {
              forceErrorCount1++;
            } else {
              forceErrorCount2++;
            }
            updateForceBattleGame();
            checkForceBattleEndGame();
          } else {
            // Modo single player
            forceErrorCount++;
            updateForceGame();
            // Verifica se o boneco está completo (perdeu)
            if (forceErrorCount >= MAX_FORCE_ERRORS) {
              setTimeout(async () => {
                await triggerDefeatAnimation();
                resetForceGame();
              }, 500);
            }
          }
        }
        // No modo Battle para Corrida, conta o erro
        else if (battleModeEnabled && currentGame === 'race') {
          // Conta o erro para o jogador anterior (já alternamos acima)
          const erroPlayer = currentPlayer === 1 ? 2 : 1; // O jogador que errou é o oposto do atual
          if (erroPlayer === 1) {
            raceErrosCount1++;
          } else {
            raceErrosCount2++;
          }
          // Atualiza as posições dos carros (mesmo sem acerto, atualiza para mostrar erros)
          updateBattleCarPositions();
          // Verifica se algum jogador terminou suas perguntas
          checkBattleEndGame();
        }
        
        // Jogo de Pares de Frases - no modo Battle também bloqueia tentativa
        if (currentGame === 'pairs') {
          setPairsSelectionAvailability(false);
        }
        
        // Não atualiza o progresso (errou)
        showModal(null);
        
        // Salva o estado se houver sessão ativa
        if (gameSessionId) {
          (async () => { await saveGameState(); })();
        }
      });

      modalContainer.addEventListener('click', (e) => {
        // Fecha se clicar no fundo escuro (sem contar como acerto)
        if (e.target === modalContainer) {
          showModal(null);
        }
      });

      // --- Event Handlers de Compartilhamento ---
      
      // Botão de Compartilhar Jogo
      if (shareGameBtn) {
        shareGameBtn.addEventListener('click', () => {
          showShareModal();
        });
      }
      
      // Botão de Copiar Link
      if (shareCopyBtn) {
        shareCopyBtn.addEventListener('click', () => {
          shareLinkInput.select();
          shareLinkInput.setSelectionRange(0, 99999); // Para mobile
          try {
            document.execCommand('copy');
            shareCopyBtn.textContent = '✓ Copiado!';
            setTimeout(() => {
              shareCopyBtn.textContent = 'Copiar';
            }, 2000);
          } catch (err) {
            // Fallback para navegadores modernos
            navigator.clipboard.writeText(shareLinkInput.value).then(() => {
              shareCopyBtn.textContent = '✓ Copiado!';
              setTimeout(() => {
                shareCopyBtn.textContent = 'Copiar';
              }, 2000);
            }).catch(() => {
              customAlert('Não foi possível copiar o link. Por favor, copie manualmente.', 'Erro');
            });
          }
        });
      }
      
      // Fechar Modal de Compartilhamento
      if (shareModalClose) {
        shareModalClose.addEventListener('click', () => {
          closeShareModal();
        });
      }
      
      if (shareModalOk) {
        shareModalOk.addEventListener('click', () => {
          closeShareModal();
        });
      }
      
      // Fechar modal ao clicar no overlay
      if (shareModal) {
        shareModal.addEventListener('click', (e) => {
          if (e.target === shareModal) {
            closeShareModal();
          }
        });
      }

      // --- Funções dos Jogos ---
      
      /**
       * Atualiza o display do jogador atual em todos os jogos
       */
      function updateCurrentPlayerDisplay() {
        console.log('updateCurrentPlayerDisplay chamado - currentPlayer:', currentPlayer);
        console.log('currentPlayerDisplay existe?', !!currentPlayerDisplay);
        
        if (!currentPlayerDisplay) {
          console.warn('currentPlayerDisplay não encontrado!');
          return;
        }
        
        if (currentPlayer === 1) {
          currentPlayerDisplay.textContent = 'Jogador 1';
          currentPlayerDisplay.className = 'font-bold text-red-600';
          console.log('Display atualizado para Jogador 1');
        } else {
          currentPlayerDisplay.textContent = 'Jogador 2';
          currentPlayerDisplay.className = 'font-bold text-blue-600';
          console.log('Display atualizado para Jogador 2');
        }
        
        // Atualiza também os displays específicos de cada jogo
        const currentPlayerForce = document.getElementById('current-player-force');
        const currentPlayerWord = document.getElementById('current-player-word');
        const currentPlayerPairs = document.getElementById('current-player-pairs');
        
        if (currentPlayerForce) {
          if (currentPlayer === 1) {
            currentPlayerForce.textContent = 'Jogador 1';
            currentPlayerForce.className = 'font-bold text-red-600';
          } else {
            currentPlayerForce.textContent = 'Jogador 2';
            currentPlayerForce.className = 'font-bold text-blue-600';
          }
        }
        
        if (currentPlayerWord) {
          if (currentPlayer === 1) {
            currentPlayerWord.textContent = 'Jogador 1';
            currentPlayerWord.className = 'font-bold text-red-600';
          } else {
            currentPlayerWord.textContent = 'Jogador 2';
            currentPlayerWord.className = 'font-bold text-blue-600';
          }
        }
        
        if (currentPlayerPairs) {
          if (currentPlayer === 1) {
            currentPlayerPairs.textContent = 'Vez do: Jogador 1';
            currentPlayerPairs.className = 'text-xs text-gray-500 mb-1 text-center';
            currentPlayerPairs.innerHTML = 'Vez do: <span class="font-bold text-red-600">Jogador 1</span>';
          } else {
            currentPlayerPairs.textContent = 'Vez do: Jogador 2';
            currentPlayerPairs.className = 'text-xs text-gray-500 mb-1 text-center';
            currentPlayerPairs.innerHTML = 'Vez do: <span class="font-bold text-blue-600">Jogador 2</span>';
          }
        }
      }
      
      /**
       * Ativa ou desativa o modo Battle
       */
      function toggleBattleMode(enabled) {
        console.log('toggleBattleMode chamado com enabled:', enabled, 'currentGame:', currentGame);
        battleModeEnabled = enabled;
        
        if (!currentGame) {
          // Se não há jogo selecionado, não pode ativar o battle mode
          if (enabled) {
            battleModeToggle.checked = false;
            battleModeEnabled = false;
            customAlert('Selecione um jogo primeiro para ativar o modo Battle!', 'Atenção');
            return;
          }
        }
        
        // Se está ativando o battle mode, reseta o jogador atual para 1 e divide as perguntas
        if (enabled) {
          currentPlayer = 1;
          console.log('Modo Battle ativado. Dividindo perguntas...');
          
          // Divide as perguntas entre os dois jogadores
          if (perguntas.length > 0) {
            const meio = Math.ceil(perguntas.length / 2);
            perguntasJogador1 = perguntas.slice(0, meio);
            perguntasJogador2 = perguntas.slice(meio);
            console.log('Perguntas divididas - Jogador 1:', perguntasJogador1.length, 'Jogador 2:', perguntasJogador2.length);
          }
          
          updateCurrentPlayerDisplay();
        } else {
          // Se está desativando, limpa as divisões de perguntas
          perguntasJogador1 = [];
          perguntasJogador2 = [];
        }
        
        // Se está ativando o battle mode, reseta o jogo PRIMEIRO
        if (enabled && currentGame) {
          if (currentGame === 'race') {
            resetBattleGame();
          } else if (currentGame === 'force') {
            resetForceBattleGame();
          } else if (currentGame === 'word') {
            (async () => { 
              await resetWordBattleGame();
              // Atualiza a exibição após resetar o jogo
              updateGameDisplay();
            })();
            return; // Retorna cedo para word game pois é assíncrono
          } else if (currentGame === 'pairs') {
            // Para o jogo de pares, apenas reseta o estado de seleção
            setPairsSelectionAvailability(false);
          }
        }
        
        // Atualiza a exibição baseado no jogo atual e modo battle (DEPOIS do reset)
        updateGameDisplay();
        
        console.log('Modo Battle atualizado. battleModeEnabled:', battleModeEnabled, 'currentPlayer:', currentPlayer);
      }
      
      /**
       * Atualiza a exibição do jogo baseado no jogo atual e modo battle
       */
      function updateGameDisplay() {
        console.log('updateGameDisplay chamado - currentGame:', currentGame, 'battleModeEnabled:', battleModeEnabled);
        
        // Esconde modos de exibição
        if (raceSinglePlayer) raceSinglePlayer.classList.add('hidden');
        if (raceBattleMode) raceBattleMode.classList.add('hidden');
        if (forceSinglePlayer) forceSinglePlayer.classList.add('hidden');
        if (forceBattleMode) forceBattleMode.classList.add('hidden');
        if (wordSinglePlayer) wordSinglePlayer.classList.add('hidden');
        if (wordBattleMode) wordBattleMode.classList.add('hidden');
        
        // Esconde TODOS os containers de jogos primeiro
        if (raceGameContainer) raceGameContainer.classList.add('hidden');
        if (forceGameContainer) forceGameContainer.classList.add('hidden');
        if (wordGameContainer) wordGameContainer.classList.add('hidden');
        if (pairsGameContainer) pairsGameContainer.classList.add('hidden');
        
        if (currentGame === 'race') {
          raceGameContainer.classList.remove('hidden');
          if (battleModeEnabled) {
            // Modo Battle ativo
            console.log('Ativando modo Battle para Corrida');
            if (raceSinglePlayer) {
              raceSinglePlayer.classList.add('hidden');
              console.log('raceSinglePlayer escondido');
            }
            if (raceBattleMode) {
              raceBattleMode.classList.remove('hidden');
              console.log('raceBattleMode mostrado');
            } else {
              console.error('raceBattleMode não encontrado!');
            }
            // Mostra ambos os carros e suas fumaças com !important para garantir visibilidade
            if (raceCar1) {
              raceCar1.style.setProperty('display', 'block', 'important');
              console.log('raceCar1 mostrado');
            } else {
              console.error('raceCar1 não encontrado!');
            }
            if (raceCar2) {
              raceCar2.style.setProperty('display', 'block', 'important');
              console.log('raceCar2 mostrado');
            } else {
              console.error('raceCar2 não encontrado!');
            }
            if (smokeCar1) {
              smokeCar1.style.setProperty('display', 'block', 'important');
              console.log('smokeCar1 mostrado');
            }
            if (smokeCar2) {
              smokeCar2.style.setProperty('display', 'block', 'important');
              console.log('smokeCar2 mostrado');
            }
          } else {
            // Modo single player
            console.log('Ativando modo Single Player para Corrida');
            if (raceBattleMode) {
              raceBattleMode.classList.add('hidden');
            }
            if (raceSinglePlayer) {
              raceSinglePlayer.classList.remove('hidden');
            }
            // Esconde o carro 2 e sua fumaça
            if (raceCar2) raceCar2.style.display = 'none';
            if (smokeCar2) smokeCar2.style.display = 'none';
          }
        } else if (currentGame === 'force') {
          forceGameContainer.classList.remove('hidden');
          if (battleModeEnabled) {
            // Modo Battle ativo
            console.log('Ativando modo Battle para Forca');
            if (forceSinglePlayer) {
              forceSinglePlayer.classList.add('hidden');
              console.log('forceSinglePlayer escondido');
            }
            if (forceBattleMode) {
              forceBattleMode.classList.remove('hidden');
              console.log('forceBattleMode mostrado');
            } else {
              console.error('forceBattleMode não encontrado!');
            }
            const forceHangmanSingle = document.getElementById('force-hangman-single');
            const forceHangmanBattle = document.getElementById('force-hangman-battle');
            if (forceHangmanSingle) {
              forceHangmanSingle.classList.add('hidden');
              console.log('forceHangmanSingle escondido');
            } else {
              console.error('forceHangmanSingle não encontrado!');
            }
            if (forceHangmanBattle) {
              forceHangmanBattle.classList.remove('hidden');
              console.log('forceHangmanBattle mostrado');
            } else {
              console.error('forceHangmanBattle não encontrado!');
            }
          } else {
            // Modo single player
            console.log('Ativando modo Single Player para Forca');
            if (forceBattleMode) forceBattleMode.classList.add('hidden');
            if (forceSinglePlayer) forceSinglePlayer.classList.remove('hidden');
            const forceHangmanSingle = document.getElementById('force-hangman-single');
            const forceHangmanBattle = document.getElementById('force-hangman-battle');
            if (forceHangmanSingle) forceHangmanSingle.classList.remove('hidden');
            if (forceHangmanBattle) forceHangmanBattle.classList.add('hidden');
          }
        } else if (currentGame === 'word') {
          wordGameContainer.classList.remove('hidden');
          if (battleModeEnabled) {
            // Modo Battle ativo
            console.log('Ativando modo Battle para Palavra Secreta');
            if (wordSinglePlayer) {
              wordSinglePlayer.classList.add('hidden');
              console.log('wordSinglePlayer escondido');
            }
            if (wordBattleMode) {
              wordBattleMode.classList.remove('hidden');
              console.log('wordBattleMode mostrado');
            } else {
              console.error('wordBattleMode não encontrado!');
            }
          } else {
            // Modo single player
            console.log('Ativando modo Single Player para Palavra Secreta');
            if (wordBattleMode) wordBattleMode.classList.add('hidden');
            if (wordSinglePlayer) wordSinglePlayer.classList.remove('hidden');
          }
          // As funções resetWordGame e resetWordBattleGame já são chamadas antes
          // e solicitam as palavras se necessário, então não precisa chamar novamente aqui
        } else if (currentGame === 'pairs') {
          console.log('=== PAIRS GAME DISPLAY ===');
          console.log('pairsGameContainer:', pairsGameContainer);
          pairsGameContainer.classList.remove('hidden');
          console.log('pairsGameContainer after remove hidden:', pairsGameContainer.className);
          // Chama updatePairsGame para mostrar a mensagem de configuração
          console.log('Calling updatePairsGame()');
          updatePairsGame();
          
          // No modo Battle, mostra indicador de qual jogador está jogando
          if (battleModeEnabled) {
            // Cria ou atualiza o display do jogador atual para o jogo de pares
            let pairsPlayerDisplay = document.getElementById('current-player-pairs');
            if (!pairsPlayerDisplay) {
              // Cria o elemento se não existir
              const pairsBoardFrame = document.getElementById('pairs-board-frame');
              if (pairsBoardFrame) {
                pairsPlayerDisplay = document.createElement('p');
                pairsPlayerDisplay.id = 'current-player-pairs';
                pairsPlayerDisplay.className = 'text-xs text-gray-500 mb-1 text-center';
                pairsBoardFrame.insertBefore(pairsPlayerDisplay, pairsBoardFrame.firstChild);
              }
            }
            if (pairsPlayerDisplay) {
              updateCurrentPlayerDisplay();
            }
          }
        }
        updatePairsSelectionState();
        
        // Atualiza o display do jogador atual se estiver no modo Battle
        if (battleModeEnabled && currentGame) {
          updateCurrentPlayerDisplay();
        }
      }
      
      /**
       * Seleciona um jogo (apenas um jogo pode estar ativo por vez)
       */
      function selectGame(gameType) {
        // PRIMEIRO: Esconde TODOS os containers de jogos antes de ativar qualquer um
        if (raceGameContainer) raceGameContainer.classList.add('hidden');
        if (forceGameContainer) forceGameContainer.classList.add('hidden');
        if (wordGameContainer) wordGameContainer.classList.add('hidden');
        if (pairsGameContainer) pairsGameContainer.classList.add('hidden');
        
        // Esconde todos os modos de exibição
        if (raceSinglePlayer) raceSinglePlayer.classList.add('hidden');
        if (raceBattleMode) raceBattleMode.classList.add('hidden');
        if (forceSinglePlayer) forceSinglePlayer.classList.add('hidden');
        if (forceBattleMode) forceBattleMode.classList.add('hidden');
        if (wordSinglePlayer) wordSinglePlayer.classList.add('hidden');
        if (wordBattleMode) wordBattleMode.classList.add('hidden');
        
        // Remove destaque de TODOS os botões
        raceGameBtn.classList.remove('bg-purple-800');
        forceGameBtn.classList.remove('bg-purple-800');
        wordGameBtn.classList.remove('bg-purple-800');
        pairsGameBtn.classList.remove('bg-purple-800');
        noGameBtn.classList.remove('bg-gray-600');
        
        // Atualiza o jogo atual
        currentGame = gameType;
        setPairsSelectionAvailability(false);
        
        // Se desativou o jogo, desativa também o battle mode
        if (gameType === null) {
          battleModeEnabled = false;
          if (battleModeToggle) battleModeToggle.checked = false;
          noGameBtn.classList.add('bg-gray-600');
          closeSidebar();
          return;
        }
        
        // Atualiza a exibição do jogo selecionado
        if (gameType === 'race') {
          raceGameBtn.classList.add('bg-purple-800');
          // Reseta o jogo baseado no modo battle
          if (battleModeEnabled) {
            resetBattleGame();
          } else {
            resetRaceGame();
          }
          updateGameDisplay();
          closeSidebar();
        } else if (gameType === 'force') {
          forceGameBtn.classList.add('bg-purple-800');
          // Reseta o jogo baseado no modo battle
          if (battleModeEnabled) {
            resetForceBattleGame();
          } else {
            resetForceGame();
          }
          updateGameDisplay();
          closeSidebar();
        } else if (gameType === 'word') {
          wordGameBtn.classList.add('bg-purple-800');
          // Reseta o jogo baseado no modo battle
          if (battleModeEnabled) {
            (async () => { await resetWordBattleGame(); })();
          } else {
            (async () => { await resetWordGame(); })();
          }
          updateGameDisplay();
          closeSidebar();
        } else if (gameType === 'pairs') {
          pairsGameBtn.classList.add('bg-purple-800');
          // Não chama resetPairsGame automaticamente - o usuário configura primeiro
          updateGameDisplay();
          closeSidebar();
        }
      }

      /**
       * Reseta o jogo da Forca
       */
      function resetForceGame() {
        if (battleModeEnabled) {
          resetForceBattleGame();
        } else {
          forceErrorCount = 0;
          updateForceGame();
        }
      }

      /**
       * Reseta o jogo de Frases Pares
       */
      async function resetPairsGame() {
        console.log('=== RESET PAIRS GAME STARTED ===');
        // Cria um modal personalizado para configuração de pares
        return new Promise((resolve) => {
        console.log('Creating pairs configuration modal...');
        // Cria o modal
        const modal = document.createElement('div');
        modal.className = 'custom-modal';
        modal.innerHTML = `
          <div class="custom-modal-content custom-modal-content-large pairs-config-modal" style="max-width: 800px;">
              <div class="text-center mb-6">
                <h3 class="text-2xl font-bold text-gray-800 mb-2">🎯 Configurar Frases Pares</h3>
                <p class="text-gray-600">Adicione frases e seus respectivos pares</p>
              </div>

              <div id="pairs-list" class="space-y-3 mb-6">
                <!-- Os pares serão adicionados aqui dinamicamente -->
              </div>

              <!-- Formulário para adicionar novo par -->
              <div id="add-pair-form" class="bg-gray-50 rounded-lg p-4 mb-6 border-2 border-dashed border-gray-300">
                <h4 class="font-semibold text-gray-700 mb-3">➕ Adicionar Novo Par</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1">Frase</label>
                    <input
                      type="text"
                      id="new-phrase-input"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Ex: Pão"
                    >
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1">Par</label>
                    <input
                      type="text"
                      id="new-pair-input"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Ex: Queijo"
                    >
                  </div>
                </div>
                <button id="add-pair-btn" class="w-full bg-purple-600 text-white px-4 py-2 rounded-md font-bold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  ➕ Adicionar Par
                </button>
              </div>

              <div class="flex gap-3">
                <button id="save-pairs-btn" class="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50" disabled>
                  ✅ Salvar e Iniciar Jogo
                </button>
                <button id="cancel-pairs-btn" class="flex-1 bg-gray-400 text-white px-4 py-3 rounded-lg font-bold hover:bg-gray-500 transition-colors">
                  ❌ Cancelar
                </button>
              </div>
            </div>
          `;

          document.body.appendChild(modal);
          modal.classList.remove('hidden');
          console.log('Pairs configuration modal shown');

          let pairs = [];

          // Função para atualizar a lista visual
          const updatePairsList = () => {
            const pairsListEl = modal.querySelector('#pairs-list');
            pairsListEl.innerHTML = '';

            if (pairs.length === 0) {
              pairsListEl.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                  <div class="text-4xl mb-2">📝</div>
                  <p>Nenhum par adicionado ainda</p>
                  <p class="text-sm">Clique em "Adicionar Par" para começar</p>
                </div>
              `;
            } else {
              pairs.forEach((pair, index) => {
                const pairEl = document.createElement('div');
                pairEl.className = 'bg-gray-50 rounded-lg p-4 border border-gray-200';
                pairEl.innerHTML = `
                  <div class="flex items-center justify-between">
                    <div class="flex-1">
                      <span class="font-semibold text-gray-800">${index + 1}. "${pair.phrase}"</span>
                      <span class="text-gray-600 mx-2">→</span>
                      <span class="font-semibold text-purple-600">"${pair.pair}"</span>
                    </div>
                    <button class="remove-pair-btn text-red-500 hover:text-red-700 p-2" data-index="${index}">
                      🗑️
                    </button>
                  </div>
                `;
                pairsListEl.appendChild(pairEl);
              });
            }

            // Atualiza o botão de salvar
            const saveBtn = modal.querySelector('#save-pairs-btn');
            saveBtn.disabled = pairs.length < 2;
            saveBtn.textContent = pairs.length < 2 ? `✅ Salvar e Iniciar Jogo (${pairs.length}/2 mínimo)` : '✅ Salvar e Iniciar Jogo';
          };

          // Função para adicionar par
          const addPair = () => {
            const phraseInput = modal.querySelector('#new-phrase-input');
            const pairInput = modal.querySelector('#new-pair-input');
            const addBtn = modal.querySelector('#add-pair-btn');

            const phrase = phraseInput.value.trim();
            const pair = pairInput.value.trim();

            // Validação
            if (phrase === '') {
              phraseInput.focus();
              phraseInput.classList.add('border-red-500', 'ring-red-500');
              setTimeout(() => phraseInput.classList.remove('border-red-500', 'ring-red-500'), 2000);
              return;
            }

            if (pair === '') {
              pairInput.focus();
              pairInput.classList.add('border-red-500', 'ring-red-500');
              setTimeout(() => pairInput.classList.remove('border-red-500', 'ring-red-500'), 2000);
              return;
            }

            // Desabilita botão temporariamente para evitar duplos cliques
            addBtn.disabled = true;
            addBtn.textContent = '⏳ Adicionando...';

            // Adiciona o par
            pairs.push({
              phrase: phrase,
              pair: pair
            });

            // Limpa os campos
            phraseInput.value = '';
            pairInput.value = '';
            phraseInput.focus();

            updatePairsList();

            // Reabilita botão
            setTimeout(() => {
              addBtn.disabled = false;
              addBtn.textContent = '➕ Adicionar Par';
            }, 500);
          };

          // Event listener para adicionar par (botão)
          modal.querySelector('#add-pair-btn').addEventListener('click', addPair);

          // Event listeners para Enter nos inputs
          modal.querySelector('#new-phrase-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
              modal.querySelector('#new-pair-input').focus();
            }
          });

          modal.querySelector('#new-pair-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
              addPair();
            }
          });

          // Event listener para remover par
          modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-pair-btn')) {
              const index = parseInt(e.target.dataset.index);
              pairs.splice(index, 1);
              updatePairsList();
            }
          });

          // Event listener para salvar
          modal.querySelector('#save-pairs-btn').addEventListener('click', () => {
            console.log('Save button clicked, pairs length:', pairs.length);
            if (pairs.length >= 2) {
              console.log('Saving pairs:', pairs);
        // Define as frases e pares coletados
        pairsPhrases = pairs;
        pairsAnswered = 0;
        pairsTotal = pairsPhrases.length;
        currentPairPhrase = null;
        pairsGameStarted = false; // Reseta a flag para permitir novo início
        setPairsSelectionAvailability(false);

              console.log('pairsPhrases set to:', pairsPhrases);
              console.log('pairsTotal:', pairsTotal);

              // Fecha o modal com animação
              modal.classList.add('hidden');
              setTimeout(() => {
                if (modal.parentNode) {
                  document.body.removeChild(modal);
                }
              }, 300);

              // Mostra confirmação
              const pairsList = pairs.map(p => `"${p.phrase}" → "${p.pair}"`).join('\n');
              setTimeout(() => {
                customAlert(`Jogo configurado com sucesso!\n\nPares criados:\n${pairsList}`, 'Configuração Completa');

                // Garante que o container do jogo esteja visível
                if (pairsGameContainer) {
                  pairsGameContainer.classList.remove('hidden');
                  console.log('pairsGameContainer made visible');
                }

                updatePairsGame();
                resolve(true);
              }, 350);
            }
          });

          // Event listener para cancelar
          modal.querySelector('#cancel-pairs-btn').addEventListener('click', () => {
            modal.classList.add('hidden');
            setTimeout(() => {
              if (modal.parentNode) {
                document.body.removeChild(modal);
              }
            }, 300);
            resolve(false);
          });

          // Fecha ao clicar fora (overlay)
          modal.addEventListener('click', (e) => {
            if (e.target === modal) {
              modal.classList.add('hidden');
              setTimeout(() => {
                if (modal.parentNode) {
                  document.body.removeChild(modal);
                }
              }, 300);
              resolve(false);
            }
          });

          // Inicializa a lista
          updatePairsList();
        });
      }
      
      /**
       * Reseta o jogo da Forca no modo Battle
       */
      function resetForceBattleGame() {
        forceErrorCount1 = 0;
        forceErrorCount2 = 0;
        currentPlayer = 1;
        updateForceBattleGame();
      }
      
      /**
       * Atualiza o jogo da Forca - mostra as partes do boneco conforme os erros
       */
      function updateForceGame() {
        // Atualiza contadores
        if (forceErrors) forceErrors.textContent = forceErrorCount;
        if (forceErrorCountDisplay) forceErrorCountDisplay.textContent = `${forceErrorCount}/${MAX_FORCE_ERRORS}`;

        // Array com as partes do boneco na ordem de aparição
        const parts = ['head', 'body', 'arm-left', 'arm-right', 'leg-left', 'leg-right'];

        // Mostra as partes conforme o número de erros
        parts.forEach((partId, index) => {
          const part = document.getElementById(partId);
          if (part) {
            if (index < forceErrorCount) {
              part.classList.remove('hidden');
            } else {
              part.classList.add('hidden');
            }
          }
        });
      }

      /**
       * Atualiza a interface do jogo de Frases Pares
       */
      function updatePairsGame() {
        console.log('=== UPDATE PAIRS GAME ===');
        console.log('pairsPhrases.length:', pairsPhrases.length);
        console.log('pairsGameStarted:', pairsGameStarted);
        console.log('pairsPhrasesDisplay:', pairsPhrasesDisplay);

        // Se não há frases configuradas, mostra a mensagem de configuração
        if (pairsPhrases.length === 0) {
          console.log('No phrases configured - showing setup message');
          if (pairsSetupMessage) {
            pairsSetupMessage.classList.remove('hidden');
            console.log('pairsSetupMessage shown');
          }
          if (pairsPhrasesDisplay) {
            pairsPhrasesDisplay.classList.add('hidden');
            console.log('pairsPhrasesDisplay hidden');
          }
          if (pairsProgress) pairsProgress.textContent = '0%';
          pairsPendingRemoval.clear();
          setPairsSelectionAvailability(false);
          return;
        }

        console.log('Phrases configured - starting game display');

        // Esconde a mensagem de configuração
        if (pairsSetupMessage) {
          pairsSetupMessage.classList.add('hidden');
          console.log('pairsSetupMessage hidden');
        }

        // Atualiza o progresso
        const progressPercent = pairsTotal > 0 ? Math.round((matchedPairs.size / pairsTotal) * 100) : 0;
        if (pairsProgress) pairsProgress.textContent = `${progressPercent}%`;

        // Limpa o display anterior
        if (pairsPhrasesDisplay) {
          pairsPhrasesDisplay.innerHTML = '';
        }

        // Se ainda não iniciou o jogo visual, faz isso agora
        if (!pairsGameStarted && pairsPhrases.length > 0) { // Verifica se há frases antes de iniciar
          console.log('Game not started - calling startPairsGame()');
          startPairsGame(); // Vai preparar o array gameCards
        } else if (pairsPhrases.length > 0) {
          console.log('Game already started - rendering cards');
        }

        // Garante que o container de frases seja visível
        if (pairsPhrasesDisplay) {
          pairsPhrasesDisplay.classList.remove('hidden');
        }

        // Chama a função de renderização do tabuleiro se o jogo foi iniciado
        if (pairsGameStarted) {
          renderPairsBoard();
        }
        updatePairsSelectionState();
      }

      /**
       * Renderiza o tabuleiro do jogo de pares a partir do array `gameCards`.
       */
      function renderPairsBoard() {
        if (!pairsPhrasesDisplay || !gameCards || gameCards.length === 0) return;

        // Limpa o display anterior
        pairsPhrasesDisplay.innerHTML = '';

        // Filtra apenas os cartões que ainda não foram combinados
        const activeCards = gameCards.filter(card => {
          const isMatched = matchedPairs.has(card.pairId);
          const pendingRemoval = pairsPendingRemoval.has(card.pairId);
          return !isMatched || pendingRemoval;
        });
        const numActiveCards = activeCards.length;

        const createVictoryBoard = () => {
          const victoryBoard = document.createElement('div');
          victoryBoard.className = 'pairs-chaotic-board pairs-board-complete';
          victoryBoard.innerHTML = `
            <div class="pairs-victory-icon">🎉</div>
            <h3 class="pairs-victory-title">Parabéns!</h3>
            <p class="pairs-victory-text">Você encontrou todos os pares!</p>
          `;
          return victoryBoard;
        };

        // Se não há mais cartões ativos, mostra mensagem de vitória
        if (numActiveCards === 0) {
          pairsPhrasesDisplay.appendChild(createVictoryBoard());
          return;
        }

        const board = document.createElement('div');
        board.className = 'pairs-chaotic-board';
        board.setAttribute('role', 'grid');

        const viewportWidth = window.innerWidth;
        const layoutPreset = viewportWidth < 640
          ? { minWidth: 120, minHeight: 90, gap: 10, padding: '0.65rem 0.85rem' }
          : viewportWidth < 1024
            ? { minWidth: 150, minHeight: 110, gap: 14, padding: '0.75rem 1rem' }
            : { minWidth: 190, minHeight: 130, gap: 18, padding: '0.85rem 1.25rem' };

        board.style.setProperty('--pairs-card-min-width', `${layoutPreset.minWidth}px`);
        board.style.setProperty('--pairs-card-min-height', `${layoutPreset.minHeight}px`);
        board.style.setProperty('--pairs-card-gap', `${layoutPreset.gap}px`);
        board.style.gridTemplateColumns = `repeat(auto-fit, minmax(${layoutPreset.minWidth}px, 1fr))`;
        board.style.gridAutoRows = `minmax(${layoutPreset.minHeight}px, 1fr)`;

        const getDynamicFontSize = (textLength) => {
          if (textLength > 80) return 0.9;
          if (textLength > 45) return 0.98;
          if (textLength > 25) return 1.05;
          return 1.15;
        };

        activeCards.forEach((card) => {
          const isPendingRemoval = pairsPendingRemoval.has(card.pairId);
          const orientation = Math.random() > 0.5 ? 'vertical' : 'horizontal';
          const cardElement = document.createElement('div');
          cardElement.className = 'pairs-chaotic-card';
          cardElement.classList.add(`orientation-${orientation}`);
          cardElement.setAttribute('data-card-id', card.id);
          cardElement.setAttribute('role', 'button');
          cardElement.setAttribute('tabindex', '0');

          const isSelected = selectedCards.some(selected => selected.id === card.id);
          if (isSelected) {
            cardElement.classList.add('is-selected');
          }
          if (isPendingRemoval) {
            cardElement.classList.add('pairs-card-pending-removal');
            cardElement.style.pointerEvents = 'none';
          }

          cardElement.style.minHeight = `${layoutPreset.minHeight}px`;
          cardElement.style.padding = layoutPreset.padding;

          const textLength = (card.content || '').length;
          const dynamicFontSize = getDynamicFontSize(textLength);
          cardElement.style.setProperty('--pairs-card-font-size', `${dynamicFontSize}rem`);

          const cardContent = document.createElement('div');
          cardContent.className = 'pairs-card-text';
          cardContent.textContent = card.content;
          cardElement.appendChild(cardContent);

          cardElement.addEventListener('click', () => handleCardClick(card.id));
          cardElement.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleCardClick(card.id);
            }
          });

          board.appendChild(cardElement);
        });

        pairsPhrasesDisplay.appendChild(board);
      }

      /**
       * Embaralha um array usando algoritmo Fisher-Yates
       */
      function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      }

      /**
       * Inicia o jogo de pares - cria os cartões embaralhados
       */
      function startPairsGame() {
        console.log('=== START PAIRS GAME ===');
        console.log('pairsGameStarted before:', pairsGameStarted);
        console.log('pairsPhrases:', pairsPhrases);

        if (pairsGameStarted) {
          console.log('Game already started, skipping...');
          return; // Evita iniciar múltiplas vezes
        }

        console.log('Starting new pairs game...');

        // Cria array com todas as frases (duplicadas para formar pares)
        gameCards = [];
        pairsPhrases.forEach((pair, index) => {
          console.log('Creating cards for pair:', pair);
          gameCards.push({
            id: `phrase-${index}`,
            type: 'phrase',
            content: pair.phrase,
            pairId: index,
            color: getRandomColor()
          });
          gameCards.push({
            id: `pair-${index}`,
            type: 'pair',
            content: pair.pair,
            pairId: index,
            color: getRandomColor()
          });
        });

        console.log('Created gameCards:', gameCards);

        // Embaralha os cartões
        gameCards = shuffleArray(gameCards);
        selectedCards = [];
        matchedPairs = new Set();
        pairsPendingRemoval = new Set();
        pairsGameStarted = true;
        setPairsSelectionAvailability(false);

        console.log('Jogo de pares iniciado com', gameCards.length, 'cartões');
        console.log('gameCards created:', gameCards);
        console.log('pairsGameStarted set to:', pairsGameStarted);
        // updatePairsGame() será chamado pelo fluxo normal após startPairsGame() retornar
      }

      /**
       * Retorna uma cor aleatória vibrante para os cartões
       */
      function getRandomColor() {
        const colors = [
          'bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400',
          'bg-purple-400', 'bg-pink-400', 'bg-indigo-400', 'bg-teal-400',
          'bg-orange-400', 'bg-cyan-400', 'bg-lime-400', 'bg-emerald-400'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
      }

      /**
       * Manipula o clique em um cartão.
       */
      function handleCardClick(cardId) {
        if (currentGame === 'pairs' && !pairsSelectionAvailable) {
          return;
        }
        if (selectedCards.length >= 2) return; // Bloqueia cliques durante a verificação do par

        const card = gameCards.find(c => c.id === cardId);
        if (!card || matchedPairs.has(card.pairId)) return;
        
        // Impede selecionar o mesmo cartão duas vezes
        if (selectedCards.some(selected => selected.id === card.id)) return;

        selectedCards.push(card);

        // Atualiza visual dos cartões selecionados
        updatePairsGame();

        // Se selecionou 2 cartões, verifica se formam par
        if (selectedCards.length === 2) {
          setPairsSelectionAvailability(false);
          // Desabilita cliques temporariamente
          const allCards = document.querySelectorAll('[data-card-id]');
          allCards.forEach(c => c.style.pointerEvents = 'none');

          setTimeout(() => {
            checkSelectedPair();
            // Reabilita cliques após a checagem e limpeza da seleção
            setTimeout(() => {
              allCards.forEach(c => c.style.pointerEvents = 'auto');
            }, 2000); // 1s + 1s de timeout em checkSelectedPair
          }, 1000);
        }
      }

      /**
       * Verifica se os cartões selecionados formam um par
       */
      function checkSelectedPair() {
        const [card1, card2] = selectedCards;
        if (!card1 || !card2) {
          return;
        }
        const matchedPairId = card1.pairId;

        if (card1.pairId === card2.pairId && card1.type !== card2.type) {
          // Par correto!
          matchedPairs.add(matchedPairId);
          pairsPendingRemoval.add(matchedPairId);
          pairsAnswered++;

          // Feedback visual verde
          showPairFeedback(true);

          // Verifica se jogo acabou
          if (matchedPairs.size === pairsPhrases.length) {
            setTimeout(() => {
              customAlert('🎉 Parabéns! Você encontrou todos os pares!', 'Jogo Concluído');
            }, 1500);
          }
        } else {
          // Par incorreto
          showPairFeedback(false);

          // Mostra notificação de erro
          setTimeout(() => {
            customAlert('❌ Par incorreto! Tente novamente.', 'Erro');
          }, 500);
        }

        // Limpa seleção e efeitos visuais
        setTimeout(() => {
          selectedCards = [];
          pairsPendingRemoval.delete(matchedPairId);
          // Remove os efeitos de ring dos cartões
          document.querySelectorAll('[data-card-id]').forEach(card => {
            card.classList.remove('ring-green-500', 'bg-green-100', 'ring-red-500', 'bg-red-100', 'ring-4', 'ring-blue-300');
          });
          updatePairsGame();
        }, 2000);
      }

      /**
       * Mostra feedback visual para pares (verde/vermelho)
       */
      function showPairFeedback(isCorrect) {
        selectedCards.forEach(card => {
          const cardElement = document.querySelector(`[data-card-id="${card.id}"]`);
          if (cardElement) {
            if (isCorrect) {
              // Verde para acertos
              cardElement.classList.add('ring-green-500', 'ring-4');
              cardElement.style.backgroundColor = '#dcfce7'; // bg-green-100
            } else {
              // Vermelho para erros
              cardElement.classList.add('ring-red-500', 'ring-4');
              cardElement.style.backgroundColor = '#fef2f2'; // bg-red-100
            }
          }
        });
      }
      
      /**
       * Atualiza o jogo da Forca no modo Battle - mostra as partes dos bonecos conforme os erros
       */
      function updateForceBattleGame() {
        // Atualiza contadores
        if (forceErrorCount1Display) forceErrorCount1Display.textContent = `${forceErrorCount1}/${MAX_FORCE_ERRORS}`;
        if (forceErrorCount2Display) forceErrorCount2Display.textContent = `${forceErrorCount2}/${MAX_FORCE_ERRORS}`;
        if (forceError1) forceError1.textContent = `${forceErrorCount1} erros`;
        if (forceError2) forceError2.textContent = `${forceErrorCount2} erros`;
        
        // Atualiza o jogador atual
        const currentPlayerForceDisplay = document.getElementById('current-player-force');
        if (currentPlayerForceDisplay) {
          if (currentPlayer === 1) {
            currentPlayerForceDisplay.textContent = 'Jogador 1';
            currentPlayerForceDisplay.className = 'font-bold text-red-600';
          } else {
            currentPlayerForceDisplay.textContent = 'Jogador 2';
            currentPlayerForceDisplay.className = 'font-bold text-blue-600';
          }
        }
        
        // Array com as partes do boneco na ordem de aparição
        const parts = ['head', 'body', 'arm-left', 'arm-right', 'leg-left', 'leg-right'];
        
        // Atualiza o boneco do Jogador 1
        parts.forEach((partName, index) => {
          const partId = partName + '1';
          const part = document.getElementById(partId);
          if (part) {
            if (index < forceErrorCount1) {
              part.classList.remove('hidden');
            } else {
              part.classList.add('hidden');
            }
          }
        });
        
        // Atualiza o boneco do Jogador 2
        parts.forEach((partName, index) => {
          const partId = partName + '2';
          const part = document.getElementById(partId);
          if (part) {
            if (index < forceErrorCount2) {
              part.classList.remove('hidden');
            } else {
              part.classList.add('hidden');
            }
          }
        });
      }
      
      /**
       * Verifica se o jogo da Forca no modo Battle terminou
       */
      function checkForceBattleEndGame() {
        if (!battleModeEnabled || currentGame !== 'force') return;
        
        // Verifica se algum jogador foi enforcado (6 erros)
        if (forceErrorCount1 >= MAX_FORCE_ERRORS) {
          setTimeout(async () => {
            await triggerVictoryAnimation();
            resetForceBattleGame();
          }, 500);
          return;
        }
        
        if (forceErrorCount2 >= MAX_FORCE_ERRORS) {
          setTimeout(async () => {
            await triggerVictoryAnimation();
            resetForceBattleGame();
          }, 500);
          return;
        }
      }
      
      /**
       * Solicita ao usuário as palavras que serão usadas no jogo
       */
      async function requestWordList() {
        const palavrasInput = await customPrompt(
          'Digite as palavras que serão usadas no jogo (separadas por vírgula ou uma por linha):\n\nExemplo: COMPUTADOR, EDUCACAO, APRENDIZADO',
          'Palavras do Jogo',
          '',
          true // isPassword = true para ocultar as palavras digitadas
        );
        
        if (!palavrasInput || palavrasInput.trim() === '') {
          await customAlert('Nenhuma palavra foi fornecida. O jogo não pode começar sem palavras.', 'Atenção');
          return false;
        }
        
        // Processa as palavras (aceita vírgula ou quebra de linha como separador)
        // Primeiro tenta dividir por quebra de linha, depois por vírgula
        let palavras = [];
        
        // Se há quebras de linha, usa elas como separador principal
        if (palavrasInput.includes('\n')) {
          palavras = palavrasInput
            .split('\n')
            .map(p => p.trim())
            .filter(p => p.length > 0);
        } else {
          // Se não há quebras de linha, divide por vírgula
          palavras = palavrasInput
            .split(',')
            .map(p => p.trim())
            .filter(p => p.length > 0);
        }
        
        // Converte todas para maiúsculas e remove espaços extras
        palavras = palavras
          .map(p => p.trim().toUpperCase())
          .filter(p => p.length > 0);
        
        if (palavras.length === 0) {
          await customAlert('Nenhuma palavra válida foi encontrada. O jogo não pode começar.', 'Atenção');
          return false;
        }
        
        wordList = palavras;
        wordListIndex = 0;
        return true;
      }
      
      /**
       * Seleciona a próxima palavra da lista
       * Só mostra o modal "Palavras Esgotadas" se a palavra atual já foi finalizada
       */
      async function getNextWord() {
        if (wordList.length === 0 || wordListIndex >= wordList.length) {
          // Verifica se a palavra atual foi finalizada antes de mostrar o modal
          const discoveredCount = wordDiscovered.filter(d => d).length;
          const wordCompleted = discoveredCount === wordSecret.length;
          
          // Só mostra o modal se a palavra atual já foi finalizada
          // Se não foi finalizada, retorna null sem mostrar o modal
          if (!wordCompleted && wordSecret && wordSecret.length > 0) {
            return null; // Palavra ainda não finalizada, não mostra modal
          }
          
          // Todas as palavras foram usadas E a palavra atual foi finalizada
          // Solicita novas palavras (após animação ter terminado)
          const continuar = await customConfirm('Todas as palavras foram usadas! Deseja adicionar novas palavras?', 'Palavras Esgotadas');
          if (continuar) {
            if (await requestWordList()) {
              wordListIndex = 0;
            } else {
              return null;
            }
          } else {
            return null;
          }
        }
        
        const palavra = wordList[wordListIndex];
        wordListIndex++;
        return palavra;
      }
      
      /**
       * Reseta o jogo da Palavra Secreta
       */
      async function resetWordGame() {
        // Se não há lista de palavras, solicita ao usuário
        if (wordList.length === 0) {
          if (!(await requestWordList())) {
            return;
          }
        }
        
        // Seleciona a próxima palavra da lista
        const nextWord = await getNextWord();
        if (!nextWord) {
          return;
        }
        
        wordSecret = nextWord;
        wordDiscovered = new Array(wordSecret.length).fill(false);
        wordTriedLetters = [];
        wordScore = 0;
        wordCanTryLetter = false;
        updateWordGame();
        enableWordLetterInput(false);
      }
      
      /**
       * Reseta o jogo da Palavra Secreta no modo Battle
       */
      async function resetWordBattleGame() {
        // Se não há lista de palavras, solicita ao usuário
        if (wordList.length === 0) {
          if (!(await requestWordList())) {
            return;
          }
        }
        
        // Seleciona a próxima palavra da lista
        const nextWord = await getNextWord();
        if (!nextWord) {
          return;
        }
        
        wordSecret = nextWord;
        wordDiscovered = new Array(wordSecret.length).fill(false);
        wordTriedLetters = [];
        wordScore1 = 0;
        wordScore2 = 0;
        currentPlayer = 1;
        wordCanTryLetter = false;
        updateWordBattleGame();
        enableWordLetterInput(true);
      }
      
      /**
       * Atualiza o display do jogo da Palavra Secreta (modo single player)
       */
      function updateWordGame() {
        if (!wordDisplay || !wordSecret || wordSecret.length === 0) return;
        
        wordDisplay.innerHTML = '';
        wordSecret.split('').forEach((letter, index) => {
          const span = document.createElement('span');
          span.className = 'text-3xl sm:text-4xl font-bold text-purple-600 border-b-4 border-purple-600 w-10 h-12 flex items-center justify-center';
          if (wordDiscovered[index]) {
            span.textContent = letter;
          } else {
            span.textContent = '_';
            span.className += ' text-gray-400';
          }
          wordDisplay.appendChild(span);
        });
        
        // Atualiza letras tentadas
        if (wordTriedLettersDisplay) {
          wordTriedLettersDisplay.textContent = wordTriedLetters.length > 0 ? wordTriedLetters.join(', ') : 'Nenhuma';
        }
        
        // Calcula progresso
        const discoveredCount = wordDiscovered.filter(d => d).length;
        const progress = (discoveredCount / wordSecret.length) * 100;
        if (wordProgress) wordProgress.textContent = `${Math.round(progress)}%`;
        
        // Verifica se ganhou
        if (discoveredCount === wordSecret.length) {
          setTimeout(async () => {
            await triggerVictoryAnimation();
            // Reseta para a próxima palavra da lista (após animação)
            await resetWordGame();
          }, 500);
        }
      }
      
      /**
       * Atualiza o display do jogo da Palavra Secreta (modo Battle)
       */
      function updateWordBattleGame() {
        if (!wordDisplayBattle || !wordSecret || wordSecret.length === 0) return;
        
        wordDisplayBattle.innerHTML = '';
        wordSecret.split('').forEach((letter, index) => {
          const span = document.createElement('span');
          span.className = 'text-2xl sm:text-3xl font-bold text-purple-600 border-b-4 border-purple-600 w-8 h-10 flex items-center justify-center';
          if (wordDiscovered[index]) {
            span.textContent = letter;
          } else {
            span.textContent = '_';
            span.className += ' text-gray-400';
          }
          wordDisplayBattle.appendChild(span);
        });
        
        // Atualiza letras tentadas
        if (wordTriedLettersBattleDisplay) {
          wordTriedLettersBattleDisplay.textContent = wordTriedLetters.length > 0 ? wordTriedLetters.join(', ') : 'Nenhuma';
        }
        
        // Atualiza jogador atual
        const currentPlayerWordDisplay = document.getElementById('current-player-word');
        if (currentPlayerWordDisplay) {
          if (currentPlayer === 1) {
            currentPlayerWordDisplay.textContent = 'Jogador 1';
            currentPlayerWordDisplay.className = 'font-bold text-red-600';
          } else {
            currentPlayerWordDisplay.textContent = 'Jogador 2';
            currentPlayerWordDisplay.className = 'font-bold text-blue-600';
          }
        }
        
        // Atualiza scores
        if (wordScore1Display) wordScore1Display.textContent = wordScore1;
        if (wordScore2Display) wordScore2Display.textContent = wordScore2;
        
        // Calcula progresso
        const discoveredCount = wordDiscovered.filter(d => d).length;
        const progress = (discoveredCount / wordSecret.length) * 100;
        const wordProgressBattleDisplay = document.getElementById('word-progress-battle');
        if (wordProgressBattleDisplay) wordProgressBattleDisplay.textContent = `${Math.round(progress)}%`;
        
        // Verifica se algum jogador ganhou
        if (discoveredCount === wordSecret.length) {
          setTimeout(async () => {
            await triggerVictoryAnimation();
            // Reseta para a próxima palavra da lista (após animação)
            await resetWordBattleGame();
          }, 500);
        }
      }
      
      /**
       * Habilita/desabilita o input de letra
       */
      function enableWordLetterInput(isBattle) {
        const input = isBattle ? wordLetterInputBattle : wordLetterInput;
        const btn = isBattle ? wordTryLetterBtnBattle : wordTryLetterBtn;
        
        if (input && btn) {
          if (wordCanTryLetter) {
            input.disabled = false;
            btn.disabled = false;
            input.focus();
            if (wordMessage) wordMessage.textContent = 'Digite uma letra e clique em Tentar!';
            if (wordMessageBattle) wordMessageBattle.textContent = 'Digite uma letra e clique em Tentar!';
          } else {
            input.disabled = true;
            btn.disabled = true;
            input.value = '';
            if (wordMessage) wordMessage.textContent = 'Acerte uma pergunta para tentar uma letra!';
            if (wordMessageBattle) wordMessageBattle.textContent = 'Acertem perguntas para tentar letras!';
          }
        }
      }
      
      /**
       * Inicializa o display da palavra (mostra os espaços/underscores)
       * Esta função é chamada quando o jogo é selecionado para mostrar os espaços imediatamente
       */
      async function initializeWordDisplay() {
        // Sempre reseta o jogo quando selecionado (solicita palavras se necessário)
        // As funções resetWordGame e resetWordBattleGame já fazem isso
        if (battleModeEnabled) {
          await resetWordBattleGame();
        } else {
          await resetWordGame();
        }
      }
      
      /**
       * Verifica se o jogador acertou a palavra completa
       */
      async function tryCompleteWord(guessedWord, isBattle) {
        if (!wordSecret || wordSecret.length === 0) return false;
        
        const guessedUpper = guessedWord.trim().toUpperCase();
        const secretUpper = wordSecret.toUpperCase();
        
        if (guessedUpper === secretUpper) {
          // Acertou a palavra!
          if (isBattle) {
            await triggerVictoryAnimation();
            await resetWordBattleGame();
          } else {
            await triggerVictoryAnimation();
            await resetWordGame();
          }
          return true;
        } else {
          // Errou a palavra!
          if (isBattle) {
            await triggerVictoryAnimation();
            await resetWordBattleGame();
          } else {
            await triggerDefeatAnimation();
            await resetWordGame();
          }
          return false;
        }
      }
      
      /**
       * Tenta uma letra no jogo da Palavra Secreta
       */
      async function tryLetter(letter, isBattle) {
        if (!letter || letter.length !== 1 || !wordSecret || wordSecret.length === 0) return;
        
        letter = letter.toUpperCase();
        
        // Verifica se a letra já foi tentada
        if (wordTriedLetters.includes(letter)) {
          if (isBattle) {
            if (wordMessageBattle) wordMessageBattle.textContent = 'Esta letra já foi tentada!';
          } else {
            if (wordMessage) wordMessage.textContent = 'Esta letra já foi tentada!';
          }
          return false;
        }
        
        // Adiciona à lista de tentadas
        wordTriedLetters.push(letter);
        
        // Verifica se a letra existe na palavra
        let found = false;
        wordSecret.split('').forEach((secretLetter, index) => {
          if (secretLetter === letter) {
            wordDiscovered[index] = true;
            found = true;
          }
        });
        
        if (found) {
          // Verifica se o jogo terminou ANTES de atualizar o display (todas as letras descobertas)
          // Primeiro marca a letra como descoberta
          let discoveredCount = wordDiscovered.filter(d => d).length;
          const gameWon = discoveredCount === wordSecret.length;
          
          // Se o jogo terminou, atualiza o display e retorna - a animação será disparada pela função updateWordGame/updateWordBattleGame
          if (gameWon) {
            // Atualiza display
            if (isBattle) {
              updateWordBattleGame();
              if (wordMessageBattle) wordMessageBattle.textContent = `✓ Letra "${letter}" encontrada!`;
            } else {
              updateWordGame();
              if (wordMessage) wordMessage.textContent = `✓ Letra "${letter}" encontrada!`;
            }
            wordCanTryLetter = false;
            return true; // Retorna indicando que o jogo terminou
          }
          
          // Se o jogo não terminou, atualiza display normalmente
          if (isBattle) {
            updateWordBattleGame();
            if (wordMessageBattle) wordMessageBattle.textContent = `✓ Letra "${letter}" encontrada!`;
          } else {
            updateWordGame();
            if (wordMessage) wordMessage.textContent = `✓ Letra "${letter}" encontrada!`;
          }
          
          // Verifica novamente se o jogo terminou após atualizar (caso a última letra tenha sido descoberta)
          discoveredCount = wordDiscovered.filter(d => d).length;
          const gameWonAfterUpdate = discoveredCount === wordSecret.length;
          
          // Se o jogo terminou após atualizar, não mostra o modal
          if (gameWonAfterUpdate) {
            wordCanTryLetter = false;
            return true; // Retorna indicando que o jogo terminou
          }
          
          // Pergunta se quer tentar adivinhar a palavra completa (apenas se o jogo não terminou)
          const wantToGuess = await customConfirm(
            `Você acertou a letra "${letter}"! Deseja tentar adivinhar a palavra completa?\n\nSe acertar: Você vence!\nSe errar: ${isBattle ? 'O oponente vence!' : 'Você perde!'}`,
            'Tentar a Palavra?'
          );
          
          if (wantToGuess) {
            const guessedWord = await customPrompt(
              'Digite a palavra completa que você acha que é:',
              'Adivinhar Palavra',
              '',
              false
            );
            
            if (guessedWord && guessedWord.trim() !== '') {
              const gameEnded = await tryCompleteWord(guessedWord, isBattle);
              if (gameEnded !== undefined) {
                return; // Sai da função pois o jogo foi finalizado
              }
            }
          }
          
          wordCanTryLetter = false;
          enableWordLetterInput(isBattle);
        } else {
          // Letra não encontrada - perde a vez (só no modo Battle)
          if (isBattle) {
            if (wordMessageBattle) wordMessageBattle.textContent = `✗ Letra "${letter}" não existe! Passa a vez.`;
            currentPlayer = currentPlayer === 1 ? 2 : 1;
            wordCanTryLetter = false;
            enableWordLetterInput(true);
            updateWordBattleGame();
          } else {
            if (wordMessage) wordMessage.textContent = `✗ Letra "${letter}" não existe!`;
            wordCanTryLetter = false;
            enableWordLetterInput(false);
          }
        }
        
        return found;
      }
      
      /**
       * Reseta o jogo de corrida (modo single player)
       */
      function resetRaceGame() {
        raceScoreCount = 0;
        raceProgressPercent = 0;
        // Armazena o total inicial de perguntas quando o jogo começa
        totalPerguntasIniciais = perguntas.length;
        if (raceCar1) {
          raceCar1.style.transform = 'translateX(-50%) translateY(0px)';
        }
        if (smokeCar1) {
          smokeCar1.style.transform = 'translateX(-50%) translateY(0px)';
        }
        if (raceProgress) {
          raceProgress.textContent = '0%';
        }
        if (raceScore) {
          raceScore.textContent = '0';
        }
      }

      /**
       * Reseta o jogo Battle (modo dois jogadores)
       * Divide as perguntas em 50% para cada jogador
       */
      function resetBattleGame() {
        raceScoreCount1 = 0;
        raceScoreCount2 = 0;
        raceErrosCount1 = 0;
        raceErrosCount2 = 0;
        raceProgressPercent1 = 0;
        raceProgressPercent2 = 0;
        currentPlayer = 1;
        perguntasErradas = 0;
        totalPerguntasIniciais = perguntas.length;
        
        // Divide as perguntas em 50% para cada jogador
        const totalPerguntas = perguntas.length;
        const metade = Math.floor(totalPerguntas / 2);
        perguntasJogador1 = perguntas.slice(0, metade).map(p => ({ ...p }));
        perguntasJogador2 = perguntas.slice(metade).map(p => ({ ...p }));
        
        // Se houver número ímpar, a pergunta extra vai para o jogador 1
        if (totalPerguntas % 2 !== 0 && perguntas.length > metade) {
          perguntasJogador1.push({ ...perguntas[metade] });
        }
        
        // Reset dos carros
        if (raceCar1) {
          raceCar1.style.transform = 'translateX(-50%) translateY(0px)';
        }
        if (raceCar2) {
          raceCar2.style.transform = 'translateX(-50%) translateY(0px)';
        }
        // Reset da fumaça
        if (smokeCar1) {
          smokeCar1.style.transform = 'translateX(-50%) translateY(0px)';
        }
        if (smokeCar2) {
          smokeCar2.style.transform = 'translateX(-50%) translateY(0px)';
        }
        
        // Reset dos displays
        if (raceScore1) raceScore1.textContent = '0';
        if (raceScore2) raceScore2.textContent = '0';
        if (raceProgress1) raceProgress1.textContent = '0%';
        if (raceProgress2) raceProgress2.textContent = '0%';
        if (currentPlayerDisplay) {
          currentPlayerDisplay.textContent = 'Jogador 1';
          currentPlayerDisplay.className = 'font-bold text-red-600';
        }
      }

      /**
       * Atualiza a posição do carro baseado no progresso atual (modo single player)
       * O progresso é calculado em tempo real baseado no total atual de perguntas
       */
      function updateRaceCarPosition() {
        if (currentGame !== 'race' || !raceCar1 || battleModeEnabled) return; // Não atualiza se battle mode está ativo
        
        // Calcula o progresso baseado no total atual de perguntas (em tempo real)
        // O total atual é: perguntas restantes + perguntas já respondidas
        const totalAtual = perguntas.length + raceScoreCount;
        
        // Armazena o total inicial apenas na primeira vez (para referência)
        if (totalPerguntasIniciais === 0 && totalAtual > 0) {
          totalPerguntasIniciais = totalAtual;
        }
        
        // Calcula o progresso baseado no total atual de perguntas (em tempo real)
        // Assim, se perguntas forem adicionadas ou removidas, o carro ajusta automaticamente
        if (totalAtual > 0) {
          raceProgressPercent = Math.min(100, (raceScoreCount / totalAtual) * 100);
        } else {
          raceProgressPercent = 0;
        }
        
        // Atualiza o display
        if (raceProgress) {
          raceProgress.textContent = `${Math.round(raceProgressPercent)}%`;
        }
        if (raceScore) {
          raceScore.textContent = raceScoreCount;
        }
        
        // Move o carro na pista (verticalmente - de cima para baixo)
        // A pista tem altura dinâmica baseada no tamanho da tela
        // Calcula a altura disponível dinamicamente
        const pistaElement = raceCar1?.parentElement?.querySelector('.relative.bg-gradient-to-b');
        const alturaPista = pistaElement ? pistaElement.offsetHeight : 500;
        const maxPosition = alturaPista - 32 - 85 - 40; // altura total - top inicial - altura do carro - linha de chegada
        const positionY = (raceProgressPercent / 100) * maxPosition;
        // Usa !important para garantir que sobrescreva a animação CSS
        raceCar1.style.setProperty('transform', `translateX(-50%) translateY(${positionY}px)`, 'important');
        // Move a fumaça junto com o carro
        if (smokeCar1) {
          smokeCar1.style.transform = `translateX(-50%) translateY(${positionY}px)`;
        }
      }

      /**
       * Atualiza as posições dos carros no modo Battle
       * Cada jogador tem 50% das perguntas iniciais
       */
      function updateBattleCarPositions() {
        if (!battleModeEnabled || !currentGame) return;
        
        // Calcula o total de perguntas de cada jogador (50% das iniciais)
        const totalPerguntasJogador1 = Math.ceil(totalPerguntasIniciais / 2);
        const totalPerguntasJogador2 = Math.floor(totalPerguntasIniciais / 2);
        
        // Calcula o progresso de cada jogador baseado nas suas próprias perguntas
        // Progresso = acertos / total de perguntas do jogador
        if (totalPerguntasJogador1 > 0) {
          raceProgressPercent1 = Math.min(100, (raceScoreCount1 / totalPerguntasJogador1) * 100);
        } else {
          raceProgressPercent1 = 0;
        }
        
        if (totalPerguntasJogador2 > 0) {
          raceProgressPercent2 = Math.min(100, (raceScoreCount2 / totalPerguntasJogador2) * 100);
        } else {
          raceProgressPercent2 = 0;
        }
        
        // Atualiza os displays
        if (raceScore1) raceScore1.textContent = raceScoreCount1;
        if (raceScore2) raceScore2.textContent = raceScoreCount2;
        if (raceProgress1) raceProgress1.textContent = `${Math.round(raceProgressPercent1)}%`;
        if (raceProgress2) raceProgress2.textContent = `${Math.round(raceProgressPercent2)}%`;
        
        // Atualiza o jogador atual
        if (currentPlayerDisplay) {
          if (currentPlayer === 1) {
            currentPlayerDisplay.textContent = 'Jogador 1';
            currentPlayerDisplay.className = 'font-bold text-red-600';
          } else {
            currentPlayerDisplay.textContent = 'Jogador 2';
            currentPlayerDisplay.className = 'font-bold text-blue-600';
          }
        }
        
        // Move os carros na pista
        // Calcula a altura disponível dinamicamente
        const pistaElement = raceCar1?.parentElement?.querySelector('.relative.bg-gradient-to-b');
        const alturaPista = pistaElement ? pistaElement.offsetHeight : 500;
        const maxPosition = alturaPista - 32 - 85 - 40; // altura total - top inicial - altura do carro - linha de chegada
        if (raceCar1) {
          const positionY1 = (raceProgressPercent1 / 100) * maxPosition;
          raceCar1.style.setProperty('transform', `translateX(-50%) translateY(${positionY1}px)`, 'important');
          // Move a fumaça junto com o carro 1
          if (smokeCar1) {
            smokeCar1.style.transform = `translateX(-50%) translateY(${positionY1}px)`;
          }
        }
        if (raceCar2) {
          const positionY2 = (raceProgressPercent2 / 100) * maxPosition;
          raceCar2.style.setProperty('transform', `translateX(-50%) translateY(${positionY2}px)`, 'important');
          // Move a fumaça junto com o carro 2
          if (smokeCar2) {
            smokeCar2.style.transform = `translateX(-50%) translateY(${positionY2}px)`;
          }
        }
      }

      /**
       * Verifica se o jogo Battle terminou e determina o vencedor
       * Regras:
       * - Se um jogador acertou todas as suas perguntas, ele vence imediatamente
       * - Se ambos acabaram suas perguntas mas erraram, vence quem errou menos
       */
      function checkBattleEndGame() {
        if (!battleModeEnabled || !currentGame) return;
        
        const totalPerguntasJogador1 = Math.ceil(totalPerguntasIniciais / 2);
        const totalPerguntasJogador2 = Math.floor(totalPerguntasIniciais / 2);
        
        // Verifica se algum jogador terminou todas as suas perguntas
        const perguntasRestantesJogador1 = perguntasJogador1.length;
        const perguntasRestantesJogador2 = perguntasJogador2.length;
        
        // Verifica se alguém acertou todas (vitória imediata)
        const jogador1AcertouTodas = raceScoreCount1 === totalPerguntasJogador1 && totalPerguntasJogador1 > 0;
        const jogador2AcertouTodas = raceScoreCount2 === totalPerguntasJogador2 && totalPerguntasJogador2 > 0;
        
        if (jogador1AcertouTodas) {
          setTimeout(async () => {
            await triggerVictoryAnimation();
            resetBattleGame();
          }, 500);
          return;
        }
        
        if (jogador2AcertouTodas) {
          setTimeout(async () => {
            await triggerVictoryAnimation();
            resetBattleGame();
          }, 500);
          return;
        }
        
        // Se ambos acabaram suas perguntas (mas não acertaram todas)
        if (perguntasRestantesJogador1 === 0 && perguntasRestantesJogador2 === 0) {
          // Nenhum acertou todas - vence quem errou menos
          const errosJogador1 = raceErrosCount1;
          const errosJogador2 = raceErrosCount2;
          
          let mensagem = '';
          if (errosJogador1 < errosJogador2) {
            mensagem = `🏆 Jogador 1 venceu! Acertou ${raceScoreCount1} de ${totalPerguntasJogador1} (errou ${errosJogador1}). Jogador 2 errou ${errosJogador2}.`;
          } else if (errosJogador2 < errosJogador1) {
            mensagem = `🏆 Jogador 2 venceu! Acertou ${raceScoreCount2} de ${totalPerguntasJogador2} (errou ${errosJogador2}). Jogador 1 errou ${errosJogador1}.`;
          } else {
            mensagem = `🏁 Empate! Jogador 1: ${raceScoreCount1} acertos, ${errosJogador1} erros. Jogador 2: ${raceScoreCount2} acertos, ${errosJogador2} erros.`;
          }
          
          setTimeout(async () => {
            // Só anima se houver vencedor (não em empate)
            if (errosJogador1 !== errosJogador2) {
              await triggerVictoryAnimation();
            }
            resetBattleGame();
          }, 500);
        }
        // Se apenas um jogador acabou mas não acertou todas, o jogo continua
      }

      /**
       * Atualiza o progresso da corrida quando o usuário acerta uma pergunta
       * O progresso é calculado baseado no total de perguntas em tempo real
       */
      function updateRaceProgress() {
        // Verifica primeiro se battle mode está ativo (tem prioridade)
        if (battleModeEnabled && currentGame) {
          // Modo Battle - dois jogadores
          if (currentPlayer === 1) {
            raceScoreCount1++;
          } else {
            raceScoreCount2++;
          }
          
          const holdTurnForWord = currentGame === 'word';
          
          // Alterna o jogador para a próxima rodada (exceto no jogo da Palavra Secreta,
          // onde a vez só troca após a tentativa da letra)
          if (!holdTurnForWord) {
            currentPlayer = currentPlayer === 1 ? 2 : 1;
          }
          
          // Atualiza displays de jogador para todos os modos
          updateCurrentPlayerDisplay();
          
          // Atualiza as posições dos carros
          updateBattleCarPositions();
          
          // Verifica se algum jogador terminou suas perguntas
          checkBattleEndGame();
        } else if (currentGame === 'race') {
          // Modo single player (sem battle mode)
          raceScoreCount++;
          
          // Se não temos o total inicial guardado, calcula agora (primeiro acerto)
          if (totalPerguntasIniciais === 0) {
            totalPerguntasIniciais = perguntas.length + raceScoreCount;
          }
          
          // Atualiza a posição do carro
          updateRaceCarPosition();
          
          // Verifica se chegou ao fim (quando todas as perguntas foram respondidas)
          if (perguntas.length === 0) {
            if (raceProgressPercent >= 100) {
              setTimeout(async () => {
                await triggerVictoryAnimation();
                resetRaceGame();
              }, 500);
            } else {
              setTimeout(async () => {
                await triggerDefeatAnimation();
              }, 500);
            }
          }
        }
      }

      // Event Listeners dos Jogos
      raceGameBtn.addEventListener('click', () => {
        selectGame('race');
      });

      forceGameBtn.addEventListener('click', () => {
        selectGame('force');
      });
      
      if (wordGameBtn) {
        wordGameBtn.addEventListener('click', () => {
          selectGame('word');
        });
      } else {
        console.error('wordGameBtn não encontrado!');
      }

      pairsGameBtn.addEventListener('click', () => {
        selectGame('pairs');
      });

      noGameBtn.addEventListener('click', () => {
        selectGame(null);
      });
      
      // Event listeners do jogo da Palavra Secreta
      if (wordTryLetterBtn) {
        wordTryLetterBtn.addEventListener('click', () => {
          const letter = wordLetterInput?.value?.trim();
          if (letter) {
            tryLetter(letter, false);
            if (wordLetterInput) wordLetterInput.value = '';
          }
        });
      }
      
      if (wordTryLetterBtnBattle) {
        wordTryLetterBtnBattle.addEventListener('click', () => {
          const letter = wordLetterInputBattle?.value?.trim();
          if (letter) {
            tryLetter(letter, true);
            if (wordLetterInputBattle) wordLetterInputBattle.value = '';
          }
        });
      }

      // Event listeners do jogo de Frases Pares
      if (pairsSetupBtn) {
        console.log('pairsSetupBtn found, adding event listener');
        pairsSetupBtn.addEventListener('click', async () => {
          console.log('pairsSetupBtn clicked!');
          await resetPairsGame();
        });
      } else {
        console.log('pairsSetupBtn not found!');
      }

      if (pairsAnswerBtn) {
        pairsAnswerBtn.addEventListener('click', async () => {
          if (!currentPairPhrase) return;

          const userAnswer = await customPrompt('Qual é o par desta frase?', 'Resposta', '');
          if (userAnswer === null) return; // Cancelado

          const correctAnswer = currentPairPhrase.pair.toLowerCase().trim();
          const givenAnswer = userAnswer.toLowerCase().trim();

          if (givenAnswer === correctAnswer) {
            // Resposta correta
            pairsAnswered++;
            await customAlert('🎉 Parabéns! Você acertou!', 'Correto');
            // Remove a frase respondida da lista
            pairsPhrases = pairsPhrases.filter(p => p !== currentPairPhrase);
            pairsTotal = pairsPhrases.length;
          } else {
            // Resposta errada
            await customAlert(`❌ Desculpe, você errou!\n\nA resposta correta era: "${currentPairPhrase.pair}"`, 'Incorreto');
          }

          // Reseta para mostrar todas as frases novamente
          currentPairPhrase = null;
          updatePairsGame();

          // Verifica se acabou o jogo
          if (pairsPhrases.length === 0) {
            await customAlert('🎊 Parabéns! Você completou todas as frases!', 'Jogo Concluído');
          }
        });
      }
      
      // Permitir Enter para tentar letra
      if (wordLetterInput) {
        wordLetterInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter' && !wordLetterInput.disabled) {
            wordTryLetterBtn?.click();
          }
        });
      }
      
      if (wordLetterInputBattle) {
        wordLetterInputBattle.addEventListener('keypress', (e) => {
          if (e.key === 'Enter' && !wordLetterInputBattle.disabled) {
            wordTryLetterBtnBattle?.click();
          }
        });
      }
      
      // Event Listener do Toggle Battle Mode
      if (battleModeToggle) {
        battleModeToggle.addEventListener('change', (e) => {
          toggleBattleMode(e.target.checked);
        });
      }

      // --- Inicialização ---
      // Verifica se há um jogo compartilhado na URL
      checkUrlForGame();
      
      questionsTextarea.value = textoInicial;
      updatePerguntas(); // Renderiza a roleta e a UI no carregamento
      
      // Salva o estado inicial se já houver uma sessão ativa
      if (gameSessionId) {
        (async () => { await saveGameState(); })();
      }
    });
