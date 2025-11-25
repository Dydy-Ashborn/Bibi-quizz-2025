export function shuffleQuestions(questions) {
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  
  // Vérifie qu'il n'y a pas deux questions consécutives du même thème
  function hasConsecutiveThemes(arr) {
    for (let i = 0; i < arr.length - 1; i++) {
      const currentTheme = arr[i].category || arr[i].theme;
      const nextTheme = arr[i + 1].category || arr[i + 1].theme;
      if (currentTheme === nextTheme) {
        return true;
      }
    }
    return false;
  }
  
  // Reshuffle jusqu'à obtenir une séquence valide
  let attempts = 0;
  let result = [...shuffled];
  
  while (hasConsecutiveThemes(result) && attempts < 1000) {
    result = [...questions].sort(() => Math.random() - 0.5);
    attempts++;
  }
  
  // Si après 1000 tentatives on n'y arrive pas, on fait un arrangement manuel
  if (hasConsecutiveThemes(result)) {
    result = manualArrangement(result);
  }
  
  return result.map(q => q.id);
}

function manualArrangement(questions) {
  const grouped = {};
  
  // Grouper par thème
  questions.forEach(q => {
    const theme = q.category || q.theme;
    if (!grouped[theme]) {
      grouped[theme] = [];
    }
    grouped[theme].push(q);
  });
  
  const themes = Object.keys(grouped);
  const result = [];
  let lastTheme = null;
  
  while (Object.values(grouped).some(arr => arr.length > 0)) {
    // Trouver un thème différent du dernier
    const availableThemes = themes.filter(t => 
      grouped[t].length > 0 && t !== lastTheme
    );
    
    if (availableThemes.length === 0) {
      // Si on ne peut pas éviter le même thème, on prend le moins utilisé
      const nextTheme = themes.find(t => grouped[t].length > 0);
      if (nextTheme) {
        result.push(grouped[nextTheme].shift());
        lastTheme = nextTheme;
      }
    } else {
      // Prendre un thème aléatoire parmi les disponibles
      const nextTheme = availableThemes[Math.floor(Math.random() * availableThemes.length)];
      result.push(grouped[nextTheme].shift());
      lastTheme = nextTheme;
    }
  }
  
  return result;
}
