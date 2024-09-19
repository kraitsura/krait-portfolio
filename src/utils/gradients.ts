// spaceGradients.ts

export interface Gradient {
    name: string;
    style: string;
  }
  
  export const darkSpaceGradients: Gradient[] = [
    {
      name: 'Deep Void',
      style: 'bg-gradient-to-br from-black via-gray-900 to-gray-800'
    },
    {
      name: 'Dark Nebula',
      style: 'bg-gradient-to-r from-black via-purple-950 to-indigo-950'
    },
    {
      name: 'Starless Night',
      style: 'bg-gradient-to-tl from-black via-gray-950 to-blue-950'
    },
    {
      name: 'Black Hole',
      style: 'bg-gradient-to-bl from-black via-gray-900 to-gray-800'
    },
    {
      name: 'Dark Matter',
      style: 'bg-gradient-to-r from-black via-slate-950 to-zinc-900'
    }
  ];
  
  export const getRandomGradient = (): Gradient => {
    const randomIndex = Math.floor(Math.random() * darkSpaceGradients.length);
    return darkSpaceGradients[randomIndex];
  };
  
  export const getGradientByName = (name: string): Gradient | undefined => {
    return darkSpaceGradients.find(gradient => gradient.name === name);
  };