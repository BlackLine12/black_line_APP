Voy a trabajar en el ticket BL-$ARGUMENTS del proyecto BlackLine.

Ejecuta estos pasos en orden:

1. Corre el script para leer el ticket:
   `.claude/scripts/jira.sh BL-$ARGUMENTS`

2. Lee el output completo del ticket

3. Sincroniza ramas remotas:
   `git fetch origin`

4. Busca la rama del ticket:
   `git branch -r | grep "BL-$ARGUMENTS-"`

5. Si existe la rama: haz checkout y pull
   Si no existe: créala desde main con formato BL-$ARGUMENTS-titulo

6. Confirma la rama actual con:
   `git branch --show-current`

7. Resume al usuario:
   - Qué dice el ticket
   - En qué rama estamos
   - Qué vas a implementar
   - Espera confirmación antes de empezar