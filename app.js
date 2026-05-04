// app.js — Entry point
// Importa los módulos y arranca la aplicación

import './modules/tasks.js';           // Registra web components
import { buildSkillTree, renderTopic } from './modules/ui.js';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('skill-tree-container');

  buildSkillTree(container, topic => {
    renderTopic(topic);
  });
});