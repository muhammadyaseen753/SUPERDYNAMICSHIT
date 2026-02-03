        let elements = [];
        let selectedElement = null;
        const table = document.getElementById('periodic-table');

        // Create particle background
        function createParticles() {
            const container = document.getElementById('particles');
            for (let i = 0; i < 30; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDuration = (10 + Math.random() * 20) + 's';
                particle.style.animationDelay = Math.random() * 5 + 's';
                particle.style.setProperty('--drift', (Math.random() * 200 - 100) + 'px');
                container.appendChild(particle);
            }
        }

        // Fetch data
        async function init() {
            try {
                const res = await fetch('https://raw.githubusercontent.com/Bowserinator/Periodic-Table-JSON/master/PeriodicTableJSON.json');
                const data = await res.json();
                elements = data.elements;
                render(elements);
                createParticles();
            } catch (error) {
                table.innerHTML = '<p style="color: red; padding: 20px;">Failed to load elements data</p>';
            }
        }

        // Render grid
        function render(dataList) {
            table.innerHTML = '';
            table.classList.add('category-mode');
            
            dataList.forEach(el => {
                const card = document.createElement('div');
                card.className = 'element-card';
                card.style.gridColumn = el.xpos;
                card.style.gridRow = el.ypos;
                card.dataset.name = el.name;
                card.dataset.sym = el.symbol;
                card.dataset.num = el.number;
                card.dataset.category = el.category.toLowerCase();

                const mass = el.atomic_mass ? el.atomic_mass.toFixed(2) : '—';

                card.innerHTML = `
                    <span class="el-num">${el.number}</span>
                    <span class="el-sym">${el.symbol}</span>
                    <span class="el-name">${el.name}</span>
                    <span class="el-mass">${mass}</span>
                `;

                card.onclick = () => showDetails(el);
                table.appendChild(card);
            });
        }

        // Search
        document.getElementById('search').addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            document.querySelectorAll('.element-card').forEach(card => {
                const match = card.dataset.name.toLowerCase().includes(query) || 
                              card.dataset.sym.toLowerCase().includes(query) ||
                              card.dataset.num.includes(query);
                card.style.opacity = match ? "1" : "0.15";
                card.style.pointerEvents = match ? "auto" : "none";
            });
        });

        // View mode
        document.getElementById('view-mode').addEventListener('change', (e) => {
            const prop = e.target.value;
            
            if (prop === 'category') {
                table.classList.add('category-mode');
                document.querySelectorAll('.element-card').forEach(c => {
                    c.style.background = '';
                    c.style.borderLeft = '';
                });
                return;
            }

            table.classList.remove('category-mode');
            const values = elements.map(el => el[prop]).filter(v => v != null && !isNaN(v));
            const min = Math.min(...values);
            const max = Math.max(...values);

            document.querySelectorAll('.element-card').forEach((card) => {
                const elNum = parseInt(card.dataset.num) - 1;
                const val = elements[elNum][prop];
                
                if (val && !isNaN(val)) {
                    const ratio = (val - min) / (max - min);
                    const intensity = 0.2 + ratio * 0.8;
                    card.style.background = `rgba(0, 242, 255, ${intensity})`;
                    card.style.borderLeft = '3px solid var(--accent)';
                } else {
                    card.style.background = 'rgba(0, 0, 0, 0.3)';
                    card.style.borderLeft = '3px solid rgba(255,255,255,0.1)';
                }
            });
        });

        // Inspector
        function showDetails(el) {
            // Remove previous selection
            document.querySelectorAll('.element-card').forEach(c => c.classList.remove('selected'));
            
            // Add selection to current element
            const currentCard = document.querySelector(`.element-card[data-num="${el.number}"]`);
            if (currentCard) currentCard.classList.add('selected');
            
            selectedElement = el;
            
            document.getElementById('empty-state').classList.add('hidden');
            document.getElementById('content').classList.remove('hidden');

            document.getElementById('det-num').innerText = `Atomic Number: ${el.number}`;
            document.getElementById('det-sym').innerText = el.symbol;
            document.getElementById('det-name').innerText = el.name;
            document.getElementById('det-cat').innerText = el.category.replace(/-/g, ' ');
            document.getElementById('det-weight').innerText = el.atomic_mass ? el.atomic_mass.toFixed(4) + ' u' : 'N/A';
            document.getElementById('det-phase').innerText = el.phase || 'Unknown';
            document.getElementById('det-config').innerText = el.electron_configuration_semantic || 'N/A';
            document.getElementById('det-by').innerText = el.discovered_by || 'Ancient';
            document.getElementById('det-sum').innerText = el.summary || 'No summary available.';

            // Enhanced Bohr Model
            const bohr = document.getElementById('bohr');
            bohr.innerHTML = `<div class="nucleus" data-protons="${el.number}p"></div>`;
            
            if (el.shells && el.shells.length > 0) {
                el.shells.forEach((electronCount, shellIndex) => {
                    const size = 50 + (shellIndex * 30);
                    const shell = document.createElement('div');
                    shell.className = 'shell';
                    shell.style.width = size + 'px';
                    shell.style.height = size + 'px';
                    shell.style.setProperty('--time', (6 + shellIndex * 3) + 's');
                    
                    // Add electrons to shell
                    for (let i = 0; i < electronCount; i++) {
                        const electron = document.createElement('div');
                        electron.className = 'electron';
                        const angle = (360 / electronCount) * i;
                        const radius = size / 2;
                        const x = radius * Math.cos(angle * Math.PI / 180);
                        const y = radius * Math.sin(angle * Math.PI / 180);
                        electron.style.transform = `translate(${x}px, ${y}px)`;
                        shell.appendChild(electron);
                    }
                    
                    bohr.appendChild(shell);
                });
            }

            // Additional properties
            const propList = document.getElementById('prop-list');
            propList.innerHTML = '';
            
            const properties = [
                { label: 'Density', value: el.density ? el.density.toFixed(3) + ' g/cm³' : 'N/A' },
                { label: 'Melting Point', value: el.melt ? el.melt.toFixed(2) + ' K' : 'N/A' },
                { label: 'Boiling Point', value: el.boil ? el.boil.toFixed(2) + ' K' : 'N/A' },
                { label: 'Electronegativity', value: el.electronegativity_pauling || 'N/A' },
                { label: 'Ionization Energy', value: el.ionization_energies && el.ionization_energies[0] ? el.ionization_energies[0] + ' kJ/mol' : 'N/A' },
                { label: 'Atomic Radius', value: el.atomic_radius ? el.atomic_radius + ' pm' : 'N/A' }
            ];

            properties.forEach(prop => {
                const item = document.createElement('div');
                item.className = 'prop-item';
                item.innerHTML = `
                    <span class="label">${prop.label}</span>
                    <span class="value">${prop.value}</span>
                `;
                propList.appendChild(item);
            });
        }

        // Legend toggle
        document.getElementById('legend-toggle').addEventListener('click', () => {
            const legend = document.getElementById('legend');
            legend.classList.toggle('show');
            const btn = document.getElementById('legend-toggle');
            btn.textContent = legend.classList.contains('show') ? 'Hide Legend' : 'Show Legend';
        });

        init();