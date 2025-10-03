type Question = {
    id: string;
    text: string;
};

type QuestionCategory = {
    title: string;
    questions: Question[];
};

export type Discipline = 'technology' | 'carpentry' | 'mechanics';

export const DISCIPLINE_QUESTIONS: Record<Discipline, QuestionCategory[]> = {
    technology: [
        {
            title: '1. Conceptualización (El "Qué" y el "Por qué")',
            questions: [
                { id: 'idea', text: '¿Cuál es la idea principal de nuestro proyecto? ¿Qué queremos construir?' },
                { id: 'feature', text: '¿Qué función especial o divertida debería tener?' },
                { id: 'name', text: '¿Qué nombre le pondremos a nuestro proyecto?' },
            ],
        },
        {
            title: '2. Funcionalidad y Mecánica (El "Cómo funcionará")',
            questions: [
                { id: 'movement', text: '¿Cómo se moverá o realizará su acción principal?' },
                { id: 'electronics', text: '¿Qué componentes electrónicos creemos que serán el "cerebro" y los "músculos"?' },
                { id: 'challenge', text: '¿Cuál será el mayor desafío técnico que tendremos que resolver?' },
            ],
        },
        {
            title: '3. Materiales, Estética y Dimensiones (El "Cómo se verá y de qué tamaño será")',
            questions: [
                { id: 'materials', text: '¿Qué materiales principales usaremos para construir la estructura?' },
                { id: 'style', text: '¿Cómo queremos que se vea? ¿Tendrá un estilo futurista, rústico, inspirado en un animal, etc.?' },
                { id: 'size', text: '¿Qué tamaño aproximado tendrá nuestro proyecto? ¿Será algo pequeño que quepa en la mano, del tamaño de una caja de zapatos, o más grande?' },
            ],
        },
        {
            title: '4. Interacción y Control (El "Cómo lo manejaremos")',
            questions: [
                { id: 'control', text: '¿Cómo le daremos órdenes a nuestro proyecto?' },
                { id: 'response', text: '¿Cómo nos responderá el proyecto?' },
            ],
        },
    ],
    carpentry: [
        {
            title: '1. Conceptualización (El "Qué" y el "Por qué")',
            questions: [
                { id: 'idea', text: '¿Cuál es la idea principal de nuestro proyecto? ¿Qué mueble u objeto de madera vamos a construir?' },
                { id: 'purpose', text: '¿Cuál será la función principal de este objeto? ¿Para qué servirá?' },
                { id: 'name', text: '¿Qué nombre le pondremos a nuestro proyecto?' },
            ],
        },
        {
            title: '2. Diseño y Estética (El "Cómo se verá")',
            questions: [
                { id: 'style', text: '¿Qué estilo visual tendrá? (ej. rústico, moderno, minimalista, clásico)' },
                { id: 'wood_type', text: '¿Qué tipo de madera principal planean usar y por qué?' },
                { id: 'finish', text: '¿Qué tipo de acabado le daremos? (ej. barniz, aceite, pintura, natural)' },
            ],
        },
        {
            title: '3. Construcción y Ensamblaje (El "Cómo lo uniremos")',
            questions: [
                { id: 'joinery', text: '¿Qué tipo de uniones o ensambles son los más importantes en su diseño? (ej. cola de milano, caja y espiga, tornillos)' },
                { id: 'challenge', text: '¿Cuál creen que será la parte más difícil o desafiante de cortar o ensamblar?' },
                { id: 'size', text: '¿Cuáles serán las dimensiones aproximadas del proyecto finalizado?' },
            ],
        },
        {
            title: '4. Herramientas y Seguridad',
            questions: [
                { id: 'tools', text: '¿Qué herramientas manuales o eléctricas son esenciales para su proyecto?' },
                { id: 'safety', text: '¿Cuál es la medida de seguridad más importante que deben recordar al trabajar en este proyecto?' },
            ],
        },
    ],
    mechanics: [
        {
            title: '1. Conceptualización (El "Qué" y el "Por qué")',
            questions: [
                { id: 'idea', text: '¿Cuál es la idea principal de nuestro proyecto? ¿Qué máquina o sistema mecánico vamos a construir?' },
                { id: 'principle', text: '¿Qué principio mecánico fundamental demostrará o utilizará? (ej. palanca, engranajes, poleas)' },
                { id: 'name', text: '¿Qué nombre le pondremos a nuestro proyecto?' },
            ],
        },
        {
            title: '2. Funcionalidad y Movimiento (El "Cómo funcionará")',
            questions: [
                { id: 'input_motion', text: '¿Cómo se iniciará el movimiento o se aplicará la fuerza de entrada?' },
                { id: 'output_motion', text: '¿Cuál es el movimiento o la acción de salida que se espera del sistema?' },
                { id: 'transmission', text: '¿Cómo se transmitirá la fuerza o el movimiento desde la entrada hasta la salida?' },
            ],
        },
        {
            title: '3. Diseño y Materiales (La "Estructura")',
            questions: [
                { id: 'materials', text: '¿Qué materiales principales usarán para los componentes clave (ejes, engranajes, estructura)?' },
                { id: 'components', text: '¿Cuáles son los componentes mecánicos más importantes que necesitarán fabricar o conseguir?' },
                { id: 'size', text: '¿Qué tamaño aproximado tendrá el mecanismo o máquina final?' },
            ],
        },
        {
            title: '4. Desafíos y Optimización',
            questions: [
                { id: 'challenge', text: '¿Cuál es el mayor desafío técnico que anticipan? (ej. fricción, alineación, resistencia)' },
                { id: 'optimization', text: '¿Cómo podrían medir si su máquina es "eficiente" o funciona bien?' },
            ],
        },
    ],
};

export const DISCIPLINE_DETAILS: Record<Discipline, { title: string; description: string; icon: string }> = {
    technology: {
        title: 'Tecnología',
        description: 'Proyectos con electrónica, programación y robótica.',
        icon: 'BookOpenIcon',
    },
    carpentry: {
        title: 'Carpintería',
        description: 'Proyectos de construcción y diseño en madera.',
        icon: 'SawIcon',
    },
    mechanics: {
        title: 'Mecánica',
        description: 'Proyectos con engranajes, palancas y sistemas de movimiento.',
        icon: 'GearsIcon',
    },
};
