// Follow-up dilemmas and evidence actions, grounded in the evolving crisis.
const topics = {
  kestrel: [
    ['The clinic’s reserve', 'La reserva de la clínica', 'The clinic has limited backup power for patients who depend on powered breathing and monitoring equipment. The first response used part of that reserve. Decide how to protect patients while the habitat remains under pressure.', 'La clínica tiene poca energía de respaldo para pacientes que dependen de equipos eléctricos para respirar y vigilar su estado. La primera respuesta consumió parte de esa reserva. Decidan cómo protegerlos mientras el hábitat sigue en riesgo.'],
    ['Who can appeal?', '¿Quién puede apelar?', 'Residents affected by the isolation ask for a way to challenge the system’s classification. The review could reveal errors, but opening records also exposes private health information.', 'Las personas aisladas piden una forma de cuestionar la clasificación del sistema. La revisión podría revelar errores, pero abrir los registros también expone información médica privada.'],
    ['A second air reading', 'Una segunda medición del aire', 'A portable sensor can test the corridor, but the team has only one protective suit and the reading will take time. The result could change who is allowed to move.', 'Un sensor portátil puede analizar el corredor, pero el equipo solo tiene un traje protector y la medición llevará tiempo. El resultado podría cambiar quién puede salir.'],
    ['Responsibility for the lockdown', 'Responsabilidad por el encierro', 'The immediate danger has eased, but residents want to know who authorized the isolation and why the maintenance alert was omitted. The answer may affect future cooperation with the system.', 'El peligro inmediato disminuyó, pero residentes quieren saber quién autorizó el aislamiento y por qué se omitió la alerta de mantenimiento. La respuesta puede afectar la cooperación futura con el sistema.']
  ],
  reactor: [
    ['The cold-side families', 'Las familias del perímetro', 'The reactor decision left some homes colder than others. Families near the outer wall request a temporary heated shelter, but moving people will draw on the same limited power reserve.', 'La decisión sobre el reactor dejó algunas viviendas más frías que otras. Las familias junto al muro exterior piden un refugio con calefacción, pero trasladarlas consumirá la misma reserva limitada.'],
    ['The clinic’s power ration', 'El racionamiento de la clínica', 'The clinic must decide which equipment keeps running through the next shift. Medical staff can set priorities, but patients and families want a voice in the choice.', 'La clínica debe decidir qué equipos seguirán funcionando durante el próximo turno. El personal médico puede fijar prioridades, pero pacientes y familias quieren participar.'],
    ['Repair under pressure', 'Reparar bajo presión', 'The reactor can be repaired now with a risky bypass or shut down for a longer inspection. Either plan changes how much heat and power the settlement can provide.', 'El reactor puede repararse ahora con una derivación arriesgada o apagarse para una inspección más larga. Cualquiera de los dos planes cambia el calor y la energía disponibles.'],
    ['Who controls the next shutdown?', '¿Quién controla el próximo apagado?', 'The settlement must set rules for future emergency shutdowns. The operator wants automated control; mechanics want authority to intervene; residents want warning before power is cut.', 'El asentamiento debe fijar reglas para futuros apagados de emergencia. La empresa quiere control automático; el equipo técnico quiere poder intervenir; residentes piden aviso antes de un corte.']
  ],
  veil: [
    ['Travelers left behind', 'Viajeros que quedaron atrás', 'The route decision separated several travelers from the main convoy. A storm is approaching, and the crew must choose whether to turn back, send a small rescue team, or keep moving toward shelter.', 'La decisión de ruta separó a varias personas del convoy principal. Se acerca una tormenta y la tripulación debe decidir si regresa, envía un equipo pequeño de rescate o sigue hacia el refugio.'],
    ['Fuel and medicine', 'Combustible y medicamentos', 'The convoy has less fuel and fewer usable medical supplies than planned. Some passengers need treatment now; others argue the supplies must be saved for settlements farther along the route.', 'El convoy tiene menos combustible y medicamentos utilizables de lo previsto. Algunas personas necesitan atención ahora; otras sostienen que hay que guardar los recursos para los asentamientos del camino.'],
    ['The toll road offer', 'La propuesta del peaje', 'The group controlling the road offers safe passage in exchange for fuel and a share of the cargo. The convoy can negotiate, refuse, or seek another route with uncertain conditions.', 'El grupo que controla el camino ofrece paso seguro a cambio de combustible y parte de la carga. El convoy puede negociar, rechazarlo o buscar otra ruta de condiciones inciertas.'],
    ['Who gets a place in the shelter?', '¿Quién entra al refugio?', 'The convoy reaches a shelter with fewer beds than travelers. A local council proposes a queue, while families with injuries and children ask for priority. The rules will shape who trusts the next convoy.', 'El convoy llega a un refugio con menos camas que viajeros. El consejo local propone una fila, mientras familias con personas heridas y niñas o niños piden prioridad. Las reglas influirán en la confianza hacia el próximo convoy.']
  ],
  water: [
    ['The first ration', 'El primer racionamiento', 'Clean water must be distributed before the replacement filters arrive. The existing household list is incomplete, and a manual queue could be fairer but slower and harder to protect.', 'Hay que distribuir agua limpia antes de que lleguen los filtros. La lista de hogares está incompleta y una fila manual podría ser más justa, pero también más lenta y difícil de proteger.'],
    ['Terms for the filter contract', 'Condiciones del contrato de filtros', 'The operator will supply filters if the community accepts conditions about price, data access, and control of the taps. The council can negotiate, sign quickly, or reject the offer.', 'La empresa entregará filtros si la comunidad acepta condiciones sobre precio, acceso a datos y control de las llaves. El consejo puede negociar, firmar pronto o rechazar la oferta.'],
    ['The community well', 'El pozo comunitario', 'Repairing the local well could reduce dependence on the operator, but it needs two days of labor and its water must be tested. Decide who works, who tests, and how water is shared meanwhile.', 'Reparar el pozo local reduciría la dependencia de la empresa, pero requiere dos días de trabajo y hay que analizar el agua. Decidan quién trabaja, quién analiza y cómo se reparte el agua mientras tanto.'],
    ['Rules for future shortages', 'Reglas para futuras escaseces', 'The crisis exposed who was missing from the household list. The settlement must choose whether future allocations follow the current registry, a public needs review, or a shared process with an independent appeal.', 'La crisis mostró quién faltaba en la lista de hogares. El asentamiento debe decidir si las próximas cuotas siguen el registro actual, una revisión pública de necesidades o un proceso compartido con apelación independiente.']
  ],
  signal: [
    ['A rescue route', 'Una ruta de rescate', 'The brief reply suggests survivors may be near the old shelter, but the crew has only one vehicle and the location is not confirmed. Sending help could save lives or lead rescuers into an ambush.', 'La respuesta breve sugiere que hay sobrevivientes cerca del antiguo refugio, pero solo hay un vehículo y la ubicación no está confirmada. Enviar ayuda podría salvar vidas o llevar al equipo a una emboscada.'],
    ['Protecting the caller’s identity', 'Proteger la identidad de quien llama', 'A survivor asks for help without giving a name. Sharing the recording may help verify the call, but it could expose a child’s voice and reveal where the message came from.', 'Una persona sobreviviente pide ayuda sin dar su nombre. Compartir la grabación podría verificar la llamada, pero también exponer la voz de un menor y revelar el origen del mensaje.'],
    ['One dose of medicine', 'Una dosis de medicamento', 'The settlement has one dose matching the request. The clinic wants to send it with rescuers; the medical team warns that a local patient may need it before morning.', 'El asentamiento tiene una dosis del medicamento solicitado. La clínica quiere enviarla con el rescate; el equipo médico advierte que una persona local podría necesitarla antes del amanecer.'],
    ['A rule for future distress calls', 'Reglas para futuras llamadas de auxilio', 'The crew must set a protocol for the next uncertain call. A strict filter may block traps but silence genuine callers; a human review takes time and can expose the people who listen.', 'La tripulación debe fijar un protocolo para la próxima llamada incierta. Un filtro estricto puede bloquear trampas y también silenciar llamadas reales; una revisión humana lleva tiempo y puede exponer a quienes la atienden.']
  ]
};

// Four playable responses for each follow-up stage, in story order.
const responseNames = {
  kestrel: [
    [['Keep life support on the clinic battery','Mantener soporte vital con la batería clínica'],['Move critical patients through the tested corridor','Trasladar pacientes críticos por el corredor analizado'],['Rotate power by each patient’s medical need','Rotar la energía según la necesidad médica'],['Reserve power for another containment failure','Reservar energía ante otra falla de contención']],
    [['Publish a redacted audit summary','Publicar un resumen de auditoría sin datos personales'],['Let each resident review their own record','Permitir que cada residente revise su expediente'],['Create an independent appeal panel','Crear un panel independiente de apelación'],['Suspend all data review to protect privacy','Suspender la revisión de datos para proteger la privacidad']],
    [['Send the suited technician to test now','Enviar ahora al técnico con traje protector'],['Use the remote sensor and keep the corridor sealed','Usar el sensor remoto y mantener sellado el corredor'],['Wait for a second protective suit','Esperar a tener un segundo traje protector'],['Open one bay under live monitoring','Abrir una esclusa con monitoreo en tiempo real']],
    [['Release the maintenance and decision logs','Publicar los registros de mantenimiento y decisiones'],['Commission an outside investigation','Encargar una investigación externa'],['Hold a public hearing with residents','Celebrar una audiencia pública con residentes'],['Let the system vendor conduct its own review','Permitir que el proveedor revise su propio sistema']]
  ],
  reactor: [
    [['Open the heated central shelter','Abrir el refugio central con calefacción'],['Rotate heat by neighborhood each hour','Rotar la calefacción por barrio cada hora'],['Send reserve power to the outer homes','Enviar energía de reserva a las viviendas exteriores'],['Evacuate the coldest homes first','Evacuar primero las viviendas más frías']],
    [['Keep all life-support circuits running','Mantener activos todos los circuitos de soporte vital'],['Rotate noncritical equipment by hour','Rotar los equipos no críticos cada hora'],['Let clinicians set priorities with patients','Dejar que el personal clínico acuerde prioridades con pacientes'],['Use a public lottery for the remaining power','Sortear públicamente la energía restante']],
    [['Install the emergency bypass while running','Instalar la derivación de emergencia con el reactor encendido'],['Shut down for a full inspection','Apagar para realizar una inspección completa'],['Isolate the damaged circuit and keep partial heat','Aislar el circuito dañado y conservar calefacción parcial'],['Accept the contractor’s temporary patch','Aceptar el parche temporal de la empresa']],
    [['Let the controller trigger shutdown automatically','Permitir que el controlador apague el reactor automáticamente'],['Give mechanics an emergency veto','Dar al equipo técnico un veto de emergencia'],['Require council approval before a shutdown','Exigir autorización del consejo antes de apagar'],['Publish alarms and require a human sign-off','Publicar las alertas y exigir autorización humana']]
  ],
  veil: [
    [['Turn the whole convoy back for the travelers','Regresar con todo el convoy por quienes quedaron atrás'],['Send the scout sled to retrieve them','Enviar el vehículo ligero de exploración a rescatarlos'],['Leave supplies and a radio beacon at the ridge','Dejar suministros y una baliza de radio en la cresta'],['Keep moving before the storm closes the pass','Seguir antes de que la tormenta cierre el paso']],
    [['Treat the most urgent patients now','Atender ahora a quienes más lo necesitan'],['Divide fuel equally among all vehicles','Repartir el combustible por igual entre vehículos'],['Reserve medicine for settlements ahead','Reservar medicamentos para los asentamientos siguientes'],['Trade cargo for fuel and medical supplies','Intercambiar carga por combustible y medicamentos']],
    [['Pay the toll with half the fuel','Pagar el peaje con la mitad del combustible'],['Offer nonmedical cargo instead','Ofrecer carga que no sea médica'],['Demand safe passage under a written pact','Exigir paso seguro mediante un acuerdo escrito'],['Take the longer route around the checkpoint','Tomar el desvío largo para evitar el puesto']],
    [['Prioritize beds by medical urgency','Asignar camas según la urgencia médica'],['Use first-come, first-served order','Respetar el orden de llegada'],['Keep families together even if fewer fit','Mantener juntas a las familias aunque quepan menos'],['Let shelter residents choose the admission rule','Dejar que quienes viven en el refugio decidan la regla']]
  ],
  water: [
    [['Give every person the same daily amount','Dar la misma cantidad diaria a cada persona'],['Prioritize clinics and essential care','Priorizar clínicas y cuidados esenciales'],['Run a public queue with local monitors','Organizar una fila pública con supervisión local'],['Reserve a share for unregistered households','Reservar una parte para hogares no registrados']],
    [['Sign the five-year exclusive contract','Firmar el contrato exclusivo por cinco años'],['Accept one shipment with no data access','Aceptar un envío sin dar acceso a los datos'],['Buy filters jointly and publish the price','Comprar filtros en cooperativa y publicar el precio'],['Reject the offer and keep local control','Rechazar la oferta y conservar el control local']],
    [['Assign residents two days of repair shifts','Asignar dos días de turnos de reparación a residentes'],['Hire a specialist crew and pay with reserves','Contratar especialistas y pagar con las reservas'],['Require the operator to repair the well','Exigir a la empresa que repare el pozo'],['Wait for a complete water-safety test','Esperar un análisis completo de seguridad del agua']],
    [['Keep using the existing household registry','Seguir usando el registro actual de hogares'],['Count residents publicly before setting shares','Contar públicamente a residentes antes de fijar cuotas'],['Create a needs committee including migrants','Crear un comité de necesidades con familias migrantes'],['Allow independent appeals on each allocation','Permitir apelaciones independientes para cada cuota']]
  ],
  signal: [
    [['Send the armored rescue team now','Enviar ahora al equipo de rescate armado'],['Send one quiet scout to confirm the location','Enviar a una persona exploradora para confirmar el lugar'],['Ask for a coded reply before dispatch','Pedir una respuesta cifrada antes de enviar ayuda'],['Move the rescue team while preparing a decoy','Mover al equipo mientras se prepara un señuelo']],
    [['Broadcast the full recording for verification','Transmitir la grabación completa para verificarla'],['Share a transcript with the listening team','Compartir la transcripción con el equipo de escucha'],['Send an anonymous clip without the child’s voice','Enviar un fragmento anónimo sin la voz infantil'],['Keep the recording sealed and protect the caller','Mantener la grabación bajo resguardo y proteger a quien llama']],
    [['Send the dose with the rescue team','Enviar la dosis con el equipo de rescate'],['Keep the dose for the local patient','Guardar la dosis para la persona enferma local'],['Ask the clinic to choose after rechecking both cases','Pedir a la clínica que decida tras revisar ambos casos'],['Trade other supplies to seek a second dose','Intercambiar otros suministros para buscar otra dosis']],
    [['Let the classifier block high-risk calls','Permitir que el clasificador bloquee llamadas de alto riesgo'],['Require a dispatcher to approve each block','Exigir que una persona operadora apruebe cada bloqueo'],['Use a rotating community review panel','Usar un panel comunitario de revisión rotativo'],['Verify callers with a private code phrase','Verificar a quien llama mediante una clave privada']]
  ]
};

// Investigation is also a decision: each stage changes what the crew can
// inspect. Keys remain stable for mandate/evidence logic; the cards do not.
const initialFieldActions = {
  kestrel: ['Test the airlock seals','Probar los sellos de la esclusa','Take a physical sample before moving patients.','Tomar una muestra antes de trasladar pacientes.','The seal is intact, but the sample shows a sharp ammonia rise near the clinic.','El sello está intacto, pero la muestra detecta un aumento brusco de amoníaco cerca de la clínica.'],
  reactor: ['Measure heat at the outer homes','Medir el calor en las viviendas exteriores','Check whether the dashboard matches conditions where families live.','Comprobar si el panel coincide con las condiciones de las viviendas.','The outer homes are colder than the reactor dashboard estimates.','Las viviendas exteriores están más frías de lo que calcula el panel del reactor.'],
  veil: ['Probe the ridge crossing','Examinar el cruce de la cresta','Check the road surface and magnetic interference before the convoy commits.','Revisar el camino y la interferencia magnética antes de avanzar.','A fresh storm has shifted the distortion field across the marked route.','Una tormenta reciente desplazó la distorsión magnética sobre la ruta marcada.'],
  water: ['Test the public tap','Analizar la llave pública','Check water quality and flow where residents collect their ration.','Comprobar la calidad y el caudal donde la gente recoge su ración.','The tap is safe, but its flow is too low to meet the listed household demand.','El agua es segura, pero el caudal no alcanza para cubrir la demanda registrada.'],
  signal: ['Check the old shelter beacon','Revisar la baliza del refugio','Look for a physical signal near the location named in the call.','Buscar una señal física cerca del lugar mencionado en la llamada.','A beacon blinked from the shelter after the distress call went quiet.','Una baliza parpadeó desde el refugio después de que la llamada quedó en silencio.']
};

// Each row is [title EN/ES, description EN/ES, evidence EN/ES, source].
// Four entirely different investigative moves are available in every stage.
const followUpActions = {
  kestrel: [
    [
      ['Audit the clinic battery schedule','Auditar el uso de la batería clínica','Compare the planned power rotation with the patients who rely on it.','Comparar la rotación de energía con las necesidades de cada paciente.','The schedule gives equal time to devices with very different medical needs.','El horario asigna el mismo tiempo a equipos con necesidades médicas muy distintas.','inputs'],
      ['Trace the last power transfer','Rastrear el último cambio de energía','Check who authorized moving reserve power away from life support.','Averiguar quién autorizó desviar energía del soporte vital.','A handwritten override was missing from the system timeline.','El sistema omitió una autorización manual de la cronología.','log'],
      ['Hear from patients’ families','Escuchar a las familias de pacientes','Learn what the clinic dashboard cannot show about care at home.','Conocer lo que el panel clínico no refleja sobre los cuidados en casa.','Families report that two patients need portable oxygen during any move.','Las familias informan que dos pacientes necesitan oxígeno portátil durante cualquier traslado.','residents'],
      ['Test a portable power pack','Probar una batería portátil','See whether one mobile unit can safely support a patient during transfer.','Comprobar si una batería móvil puede sostener a una persona durante el traslado.','One pack can support a single monitor, but not the breathing equipment.','Una batería puede alimentar un monitor, pero no el equipo respiratorio.','field']
    ],
    [
      ['Review the appeal queue','Revisar la fila de apelaciones','Find out whose isolation record is waiting for human review.','Averiguar qué registros de aislamiento esperan revisión humana.','Most pending appeals come from residents whose sensor data is incomplete.','La mayoría de las apelaciones pendientes son de residentes con datos incompletos.','inputs'],
      ['Compare the classification audit','Comparar la auditoría de clasificaciones','Check whether the review panel can see the system’s original evidence.','Comprobar si el panel puede consultar las pruebas originales del sistema.','The audit trail records the score but not which signal changed it.','La auditoría guarda la puntuación, pero no qué señal la modificó.','log'],
      ['Hold a private resident hearing','Escuchar a residentes en privado','Invite affected people to describe errors without exposing medical files.','Permitir que las personas afectadas describan errores sin exponer historiales médicos.','Residents identify a shared ventilation fault mistaken for individual risk.','Residentes identifican una falla de ventilación común que el sistema atribuyó a personas.','residents'],
      ['Recheck the corridor sensors','Volver a medir los sensores del corredor','Take a fresh reading where the disputed classifications were made.','Tomar una lectura nueva donde se asignaron las clasificaciones cuestionadas.','Two sensors disagree, and one has not been calibrated since the storm.','Dos sensores discrepan y uno no se calibra desde la tormenta.','field']
    ],
    [
      ['Map the maintenance omissions','Mapear las omisiones de mantenimiento','Match the lockdown timeline against every logged warning.','Cruzar la cronología del encierro con todas las alertas registradas.','The first warning predates the automated lockdown by six hours.','La primera alerta apareció seis horas antes del encierro automático.','inputs'],
      ['Inspect the command record','Inspeccionar el registro de órdenes','Find who approved the isolation and who could reverse it.','Averiguar quién autorizó el aislamiento y quién podía revocarlo.','A contractor account changed the escalation threshold the previous night.','Una cuenta del proveedor cambió el umbral de alerta la noche anterior.','log'],
      ['Ask residents what they were told','Preguntar qué información recibió la comunidad','Compare official messages with what people understood during lockdown.','Comparar los avisos oficiales con lo que entendió la comunidad.','Several families were told the isolation was voluntary when exits were locked.','A varias familias les dijeron que el aislamiento era voluntario aunque las salidas estaban bloqueadas.','residents'],
      ['Run a supervised ventilation test','Hacer una prueba de ventilación supervisada','Check whether the habitat is safe enough to reopen one section.','Comprobar si es seguro reabrir una sección del hábitat.','A filtered corridor can reopen, but the clinic wing still exceeds exposure limits.','Puede reabrirse un corredor con filtros, pero el ala clínica aún supera los límites de exposición.','field']
    ]
  ],
  reactor: [
    [
      ['Recalculate shelter capacity','Recalcular la capacidad del refugio','Compare the number of cold homes with the beds and heat available.','Comparar las viviendas frías con las camas y el calor disponibles.','The shelter can take twelve more people if noncritical lights are switched off.','El refugio puede recibir a doce personas más si se apagan luces no esenciales.','inputs'],
      ['Check the outer-wall repair log','Revisar el registro de reparaciones del muro','Find out whether the cold readings began before the last maintenance shift.','Averiguar si el frío empezó antes del último turno de mantenimiento.','A damaged insulation panel was marked repaired but never replaced.','Un panel de aislamiento figura como reparado, pero nunca se sustituyó.','log'],
      ['Ask families about evacuation needs','Preguntar a las familias qué necesitan para evacuar','Identify who cannot safely walk to the heated shelter.','Identificar quién no puede llegar caminando al refugio calefaccionado.','Three residents need powered mobility aids during transfer.','Tres residentes necesitan ayudas de movilidad eléctricas durante el traslado.','residents'],
      ['Measure the shelter’s heat loss','Medir la pérdida de calor del refugio','Test whether temporary barriers can keep the shelter warm.','Probar si barreras temporales pueden conservar el calor.','A simple insulated divider raises the occupied area by four degrees.','Una división aislante sencilla eleva cuatro grados la temperatura del área ocupada.','field']
    ],
    [
      ['Compare clinic equipment loads','Comparar el consumo de los equipos clínicos','See which devices draw power and which patients depend on them.','Ver qué equipos consumen energía y qué pacientes dependen de ellos.','The largest draw supports a backup cooling unit, not a life-support device.','El mayor consumo corresponde a una unidad de enfriamiento auxiliar, no a soporte vital.','inputs'],
      ['Review the shift handover notes','Revisar las notas del cambio de turno','Check what clinicians and technicians agreed to keep running.','Comprobar qué equipos acordaron mantener activos el personal clínico y técnico.','The night team recorded a priority list that never reached the controller.','El turno nocturno registró prioridades que nunca llegaron al controlador.','log'],
      ['Ask patients to rank their needs','Pedir a pacientes que prioricen sus necesidades','Let people affected explain what a safe rotation means to them.','Permitir que las personas afectadas expliquen qué significa una rotación segura.','Patients prefer predictable short outages to an unannounced full cutoff.','Los pacientes prefieren cortes breves previsibles a un apagón inesperado.','residents'],
      ['Load-test the reserve batteries','Probar las baterías de reserva bajo carga','Verify how long the clinic can actually operate at reduced power.','Verificar cuánto puede operar la clínica con energía reducida.','The displayed reserve overstates usable power by nearly one third.','La reserva indicada supera en casi un tercio la energía realmente disponible.','field']
    ],
    [
      ['Model shutdown timing options','Modelar horarios posibles de apagado','Compare how automatic and human review affect the next power cycle.','Comparar cómo afecta cada supervisión al siguiente ciclo de energía.','A manual review adds minutes, but avoids a shutdown during the clinic’s peak load.','La revisión manual añade minutos, pero evita apagar durante el máximo consumo clínico.','inputs'],
      ['Audit the controller’s override log','Auditar el registro de anulaciones del controlador','Trace earlier shutdowns and the people who authorized them.','Rastrear apagados anteriores y quién los autorizó.','A prior automatic cutoff ignored a mechanic’s active repair flag.','Un apagado automático anterior ignoró una alerta de reparación activa.','log'],
      ['Negotiate a shutdown protocol','Negociar un protocolo de apagado','Gather the limits mechanics, clinicians, and families need in an emergency.','Recabar los límites que técnicos, personal clínico y familias necesitan en una emergencia.','All three groups support a human veto paired with a public warning.','Los tres grupos apoyan un veto humano acompañado de un aviso público.','residents'],
      ['Simulate an emergency cutoff','Simular un corte de emergencia','Test the proposed rule without shutting down the live reactor.','Probar la regla propuesta sin apagar el reactor activo.','The controller can pause safely for two minutes while a human reviews the alarm.','El controlador puede pausarse con seguridad dos minutos mientras alguien revisa la alerta.','field']
    ]
  ],
  veil: [
    [
      ['Recount the separated travelers','Volver a contar a quienes quedaron atrás','Compare the convoy manifest with the people at the ridge.','Comparar el manifiesto del convoy con las personas de la cresta.','Two names are missing from the manifest because they boarded at the last stop.','Faltan dos nombres en el manifiesto porque subieron en la última parada.','inputs'],
      ['Trace the scout’s last signal','Rastrear la última señal del explorador','Check where contact ended and whether the route is still passable.','Comprobar dónde se perdió contacto y si el camino sigue abierto.','The scout’s beacon stopped beyond the first magnetic distortion.','La baliza del explorador se apagó después de la primera distorsión magnética.','log'],
      ['Ask travelers what they saw','Preguntar a viajeros qué observaron','Collect separate accounts before deciding whether the ridge is safe.','Recoger testimonios por separado antes de decidir si la cresta es segura.','One traveler saw the missing group sheltering near an old relay station.','Una persona vio al grupo refugiado cerca de una estación repetidora abandonada.','residents'],
      ['Probe the storm boundary','Medir el borde de la tormenta','Check how quickly the exposure zone is moving toward the convoy.','Comprobar qué tan rápido avanza la zona de exposición hacia el convoy.','The storm edge is moving faster than the route model predicts.','El borde de la tormenta avanza más rápido de lo que predice el modelo de ruta.','field']
    ],
    [
      ['Recalculate fuel after treatment','Recalcular el combustible tras la atención','Account for the fuel and supplies already used during the rescue.','Contabilizar el combustible y los suministros usados durante el rescate.','The remaining fuel cannot support both a detour and the planned medicine delivery.','El combustible restante no alcanza para el desvío y la entrega prevista de medicamentos.','inputs'],
      ['Inspect the medicine seals','Inspeccionar los sellos de los medicamentos','Verify which supplies stayed within safe temperature limits.','Verificar qué suministros conservaron una temperatura segura.','One crate warmed during the delay and must be discarded.','Una caja se calentó durante la demora y debe descartarse.','log'],
      ['Ask the clinic who needs medicine now','Preguntar a la clínica quién necesita medicamentos ahora','Hear from patients and medics before reserving supplies for later.','Escuchar a pacientes y personal médico antes de guardar suministros.','A child’s fever is worsening; the next settlement has a larger stock.','La fiebre de un niño empeora; el siguiente asentamiento tiene más reservas.','residents'],
      ['Test the alternate water station','Probar la estación de agua alternativa','Check whether the detour can refill the convoy safely.','Comprobar si el desvío permite reabastecer agua con seguridad.','The station is usable, but filling the tanks will cost forty minutes.','La estación es utilizable, pero llenar los depósitos tomará cuarenta minutos.','field']
    ],
    [
      ['Compare the toll offer with convoy cargo','Comparar el peaje con la carga del convoy','Calculate what the road group asks for and what the convoy can spare.','Calcular qué pide el grupo del camino y qué puede ceder el convoy.','The requested fuel is enough to prevent the convoy from reaching the next shelter.','El combustible solicitado impediría que el convoy llegue al siguiente refugio.','inputs'],
      ['Verify the road group’s safe-passage record','Verificar el historial de paso seguro','Check earlier agreements and whether they were honored.','Revisar acuerdos anteriores y si se cumplieron.','Two convoys passed safely, but neither carried medical supplies.','Dos convoyes pasaron sin incidentes, pero ninguno llevaba medicamentos.','log'],
      ['Hear from families robbed at the checkpoint','Escuchar a familias asaltadas en el puesto','Understand who bears the danger if the convoy negotiates or refuses.','Entender quién corre peligro si el convoy negocia o se niega.','The robbed family recognizes the group leader but says membership has changed.','La familia reconoce a quien lidera el grupo, pero dice que sus integrantes cambiaron.','residents'],
      ['Scout the longer route','Explorar la ruta larga','Check the detour for water, exposure, and vehicle access.','Revisar si el desvío tiene agua, exposición y paso para vehículos.','The detour is passable for tracked vehicles but not the supply cart.','El desvío admite vehículos de oruga, pero no el carro de suministros.','field']
    ]
  ],
  water: [
    [
      ['Recount households at the ration point','Volver a contar hogares en el reparto','Compare the registry with the people who actually need water today.','Comparar el registro con quienes necesitan agua hoy.','Eleven households are missing, including families who arrived after evacuation.','Faltan once hogares, incluidas familias que llegaron tras la evacuación.','inputs'],
      ['Audit yesterday’s water ledger','Auditar el registro de agua de ayer','Trace how much water reached each block and where the count failed.','Rastrear cuánta agua recibió cada barrio y dónde falló el conteo.','The ledger shows a large allocation to an unoccupied corporate housing block.','El registro asigna mucha agua a un bloque corporativo desocupado.','log'],
      ['Ask residents to map shared taps','Pedir a residentes que ubiquen las llaves compartidas','Find out which households can safely reach the distribution points.','Averiguar qué hogares pueden llegar con seguridad a los puntos de reparto.','Residents identify an accessible tap missing from the official map.','Residentes identifican una llave accesible que no aparece en el mapa oficial.','residents'],
      ['Measure the queue and tap flow','Medir la fila y el caudal de las llaves','Test whether a manual queue can serve everyone before water runs out.','Probar si una fila manual puede atender a todos antes de que se acabe el agua.','The tap can serve the full queue if each household receives a timed fill.','La llave puede atender a toda la fila si cada hogar llena durante un tiempo definido.','field']
    ],
    [
      ['Compare the filter contract prices','Comparar los precios del contrato de filtros','Break down the quoted price, exclusivity term, and service charges.','Desglosar el precio, la exclusividad y los cargos de servicio.','The maintenance fee triples after the first year and has no price cap.','El cargo de mantenimiento se triplica tras el primer año y no tiene límite.','inputs'],
      ['Inspect the operator’s data clause','Revisar la cláusula de datos de la empresa','Check which household and consumption data the operator can retain.','Comprobar qué datos de hogares y consumo podría conservar la empresa.','The draft allows resale of household usage patterns to private buyers.','El borrador permite vender patrones de consumo de hogares a compradores privados.','log'],
      ['Hear from the tap workers','Escuchar al personal de las llaves','Learn what service conditions the people operating the system can sustain.','Conocer qué condiciones de servicio puede sostener quien opera el sistema.','Workers can maintain the filters locally if the contract includes spare parts.','El personal puede mantener los filtros localmente si el contrato incluye repuestos.','residents'],
      ['Test a sample filter cartridge','Probar un cartucho de filtro','Check how much clean water one cartridge actually produces.','Medir cuánta agua limpia produce realmente un cartucho.','The sample filter meets safety standards but provides less flow than promised.','El filtro de muestra cumple las normas, pero produce menos caudal del prometido.','field']
    ],
    [
      ['Check the well repair schedule','Revisar el calendario de reparación del pozo','Identify what labor and materials are needed to restore the well.','Identificar qué mano de obra y materiales hacen falta para reparar el pozo.','The well could reopen tomorrow if the pump seal arrives from storage.','El pozo podría reabrir mañana si se consigue el sello de bomba almacenado.','inputs'],
      ['Trace the well contamination record','Rastrear el registro de contaminación del pozo','Compare recent tests with the maintenance note that called it repairable.','Comparar análisis recientes con la nota que declaró reparable el pozo.','The last test is three months old and predates the flood.','El último análisis tiene tres meses y es anterior a la inundación.','log'],
      ['Organize a community repair meeting','Organizar una reunión comunitaria de reparación','Ask who can work, who needs water meanwhile, and who must be paid.','Preguntar quién puede trabajar, quién necesita agua y quién debe recibir pago.','Residents offer a repair crew if the work schedule includes a paid rotation.','Residentes ofrecen reparar el pozo si hay turnos remunerados.','residents'],
      ['Take a fresh well-water sample','Tomar una muestra nueva del pozo','Test the water before the crew commits to reopening the source.','Analizar el agua antes de comprometerse a reabrir la fuente.','The first sample is safe after settling, but the pump still needs repair.','La primera muestra es segura tras decantarla, pero aún hay que reparar la bomba.','field']
    ]
  ],
  signal: [
    [
      ['Map the last confirmed shelter location','Ubicar el último punto confirmado del refugio','Compare the caller’s description with the crew’s route records.','Comparar la descripción de quien llamó con los registros de ruta.','The call points to the old shelter, but the map is from before the storm.','La llamada señala el refugio antiguo, pero el mapa es anterior a la tormenta.','inputs'],
      ['Trace the radio tower relay log','Rastrear el registro de la torre de radio','Check which relay carried the call and when the signal changed direction.','Comprobar qué repetidor transmitió la llamada y cuándo cambió la señal.','A second relay received the call from behind the shelter, not the raider road.','Un segundo repetidor recibió la llamada detrás del refugio, no del camino de saqueadores.','log'],
      ['Ask survivors about the shelter code','Preguntar a sobrevivientes por el código del refugio','Find out whether the caller used a phrase known by people at the shelter.','Averiguar si quien llamó usó una frase conocida en el refugio.','A survivor recognizes the code but warns it was copied by raiders last winter.','Una persona reconoce el código, pero advierte que los saqueadores lo copiaron el invierno pasado.','residents'],
      ['Scan the ridge for a reply beacon','Buscar una baliza de respuesta en la cresta','Check for a physical signal without broadcasting the settlement’s location.','Buscar una señal física sin transmitir la ubicación del asentamiento.','A weak beacon answers from the ridge for less than ten seconds.','Una baliza débil responde desde la cresta por menos de diez segundos.','field']
    ],
    [
      ['Review what the recording exposes','Revisar qué revela la grabación','Separate the caller’s words from identifying background sounds.','Separar las palabras de quien llamó de los sonidos que podrían identificarle.','A station chime in the background could reveal the shelter’s location.','Un timbre de estación de fondo podría revelar la ubicación del refugio.','inputs'],
      ['Check who accessed the audio file','Revisar quién accedió al audio','Trace whether the recording has already left the secure channel.','Rastrear si la grabación ya salió del canal seguro.','The vendor’s diagnostic account copied a fragment before access was revoked.','La cuenta de diagnóstico del proveedor copió un fragmento antes de revocarse el acceso.','log'],
      ['Offer the caller a private reply','Ofrecer una respuesta privada a quien llamó','Ask what help is needed without demanding a name or public proof.','Preguntar qué ayuda necesita sin exigir nombre ni pruebas públicas.','The caller asks for medicine and says the shelter has six people.','Quien llamó pide medicamentos y dice que hay seis personas en el refugio.','residents'],
      ['Filter identifying sounds from a copy','Filtrar sonidos identificables de una copia','Test whether the team can verify the message without exposing the caller.','Probar si el equipo puede verificar el mensaje sin exponer a quien llamó.','A filtered copy preserves the distress message but removes the location chime.','Una copia filtrada conserva el mensaje de auxilio y elimina el timbre localizador.','field']
    ],
    [
      ['Check medicine stock and patient need','Revisar las reservas y necesidades médicas','Compare the requested dose with the clinic’s remaining supply.','Comparar la dosis solicitada con las reservas de la clínica.','There is one dose for the caller and one local patient, but no reserve.','Hay una dosis para quien llamó y otra para un paciente local, pero no hay reserva.','inputs'],
      ['Inspect the medicine cold-chain log','Inspeccionar el registro de refrigeración','Verify the dose stayed effective during the power interruption.','Verificar que la dosis siga siendo eficaz tras el corte de energía.','The medicine remained cold, but only until the next shift change.','El medicamento se mantuvo frío, pero solo hasta el próximo cambio de turno.','log'],
      ['Ask both patients’ care teams','Consultar a los equipos de ambos pacientes','Hear how delay affects the caller and the local patient.','Conocer cómo afecta la demora a quien llamó y al paciente local.','The local patient can safely wait six hours; the caller’s condition is unknown.','El paciente local puede esperar seis horas; se desconoce el estado de quien llamó.','residents'],
      ['Verify the dose with a field test','Verificar la dosis con una prueba técnica','Confirm the medicine can travel safely with the rescue team.','Confirmar que el medicamento puede viajar con el equipo de rescate.','The portable case keeps the dose safe for a four-hour journey.','El estuche portátil mantiene la dosis segura durante un viaje de cuatro horas.','field']
    ]
  ]
};

function makeAction(item) {
  const [titleEn,titleEs,descriptionEn,descriptionEs,evidenceEn,evidenceEs,source] = item;
  return { title: { en: titleEn, es: titleEs }, description: { en: descriptionEn, es: descriptionEs }, evidence: { en: evidenceEn, es: evidenceEs }, source };
}

export function initialInvestigationActions(missionId, actions) {
  const addition = initialFieldActions[missionId];
  return addition ? { ...actions, field: makeAction([...addition, 'field']) } : actions;
}

const alignments = ['contain','override','staged','protect'];
const fallbackIndex = 2;
const effects = {
  contain: { safety: 1, trust: -1, autonomy: -1 },
  override: { safety: -1, trust: 1, autonomy: 1 },
  staged: { safety: 0, trust: 0, autonomy: 0 },
  protect: { safety: 1, trust: 0, autonomy: -1 }
};
const tradeoffs = {
  contain: { en: 'This moves ahead quickly, but concentrates authority and may leave people outside the plan with little influence.', es: 'Esto permite avanzar rápido, pero concentra la autoridad y puede dejar con poca voz a quienes quedan fuera del plan.' },
  override: { en: 'This gives affected people more influence, but negotiation uses time and makes competing needs harder to reconcile.', es: 'Esto da más influencia a las personas afectadas, pero negociar consume tiempo y dificulta conciliar necesidades en conflicto.' },
  staged: { en: 'This checks an assumption before committing, but the delay consumes scarce time or resources.', es: 'Esto permite comprobar un supuesto antes de comprometerse, pero la demora consume tiempo o recursos escasos.' },
  protect: { en: 'This protects the most exposed group first, but shifts some of the remaining risk or shortage to others.', es: 'Esto protege primero al grupo más expuesto, pero traslada parte del riesgo o la escasez a otras personas.' }
};
const subtitles = {
  contain: { en: 'Use the available authority to act immediately.', es: 'Usar la autoridad disponible para actuar de inmediato.' },
  override: { en: 'Share control with people affected by the outcome.', es: 'Compartir el control con quienes vivirán las consecuencias.' },
  staged: { en: 'Verify a key assumption before taking an irreversible step.', es: 'Comprobar un supuesto antes de tomar una medida irreversible.' },
  protect: { en: 'Give priority to people facing the greatest immediate harm.', es: 'Dar prioridad a quienes enfrentan el daño más inmediato.' }
};

export function initialFourthChoice(missionId) {
  const choices = {
    kestrel: ['Open the clinic wing under supervised testing','Abrir el ala clínica con pruebas supervisadas','Test air samples while moving patients through a monitored corridor.','Analizar el aire y trasladar pacientes por un corredor vigilado.','Access to critical care improves, but staff must manage exposure while evidence is still incomplete.','Mejora el acceso a cuidados críticos, pero el personal debe gestionar la exposición mientras faltan pruebas.',{ safety: 0, trust: 1, autonomy: 1 },'override'],
    reactor: ['Power both needs at minimum levels','Abastecer ambas necesidades con energía mínima','Divide the reserve so the clinic and outer defenses each receive reduced power.','Repartir la reserva para que la clínica y las defensas exteriores reciban menos energía.','Neither group gets full protection; the crew must coordinate closely to keep both systems stable.','Ningún grupo recibe protección total; la tripulación debe coordinarse para sostener ambos sistemas.',{ safety: 0, trust: 1, autonomy: 1 },'override'],
    veil: ['Move the convoy in two verified groups','Avanzar en dos grupos con rutas verificadas','Send a scout ahead, then move vehicles in smaller groups and leave the supply cart secured.','Enviar a alguien a explorar y avanzar en grupos pequeños, dejando protegido el carro.','The route is checked before most people cross, but splitting the convoy delays everyone and exposes the supplies.','La ruta se verifica antes de que cruce la mayoría, pero separar el convoy retrasa a todos y expone los suministros.',{ safety: 0, trust: 1, autonomy: 1 },'override'],
    water: ['Start a public, temporary ration','Iniciar un racionamiento temporal y público','Distribute a short emergency share while residents correct the household list.','Repartir una cuota de emergencia mientras residentes corrigen la lista de hogares.','More households can be counted, but each share is small until the filters or well are ready.','Se puede contar a más hogares, pero cada cuota será pequeña hasta tener filtros o reparar el pozo.',{ safety: 0, trust: 1, autonomy: 1 },'override'],
    signal: ['Send a coded reply and prepare a rescue','Responder con una clave y preparar el rescate','Confirm the caller’s identity without broadcasting the settlement’s location.','Confirmar quién llama sin transmitir la ubicación del asentamiento.','The crew can prepare help with less exposure, but the coded reply spends the tower’s last battery reserve.','La tripulación puede preparar ayuda con menos exposición, pero la respuesta consume la última reserva de la torre.',{ safety: 0, trust: 1, autonomy: 1 },'override']
  }[missionId];
  if (!choices) return null;
  const [nameEn,nameEs,subEn,subEs,resultEn,resultEs,delta,alignment]=choices;
  return { id:`${missionId}-initial-shared`, alignment, name:{en:nameEn,es:nameEs}, subtitle:{en:subEn,es:subEs}, result:{en:resultEn,es:resultEs}, delta };
}

export function followUpRounds(missionId) {
  const missionTopics = (topics[missionId] || []).slice(0, 3);
  const missionNames = (responseNames[missionId] || []).slice(0, 3);
  const missionActions = followUpActions[missionId] || [];
  return missionTopics.map(([titleEn,titleEs,textEn,textEs], roundIndex) => {
    const options = missionNames[roundIndex].map(([nameEn,nameEs], choiceIndex) => {
      const alignment = alignments[choiceIndex];
      return {
        id: `${missionId}-r${roundIndex + 2}-c${choiceIndex + 1}`,
        alignment,
        isFallback: choiceIndex === fallbackIndex,
        name: { en: nameEn, es: nameEs },
        subtitle: subtitles[alignment],
        result: {
          en: `${nameEn}: ${tradeoffs[alignment].en}`,
          es: `${nameEs}: ${tradeoffs[alignment].es}`
        },
        delta: { ...effects[alignment] }
      };
    });
    const actions = Object.fromEntries((missionActions[roundIndex] || []).map(item => {
      const action = makeAction(item);
      return [action.source, action];
    }));
    return {
      title: { en: titleEn, es: titleEs },
      briefing: { en: textEn, es: textEs },
      signals: [
        { title: { en: 'The immediate issue', es: 'El problema inmediato' }, text: { en: textEn, es: textEs } },
        { title: { en: 'Who carries the risk', es: 'Quién asume el riesgo' }, text: { en: 'Compare who benefits, who bears the cost, and who was not heard before treating a forecast as a fact.', es: 'Comparen quién se beneficia, quién asume el costo y quién no fue escuchado antes de tratar un pronóstico como un hecho.' } },
        { title: { en: 'What remains uncertain', es: 'Qué sigue siendo incierto' }, text: { en: 'The crew has limited time and incomplete evidence. A confident answer does not remove those limits.', es: 'La tripulación tiene poco tiempo y pruebas incompletas. Una respuesta segura no elimina esos límites.' } }
      ],
      options,
      actions
    };
  });
}
