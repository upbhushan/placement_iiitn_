// Utility functions for Apple-style colors

// Keep avatar neutral, elegant – no rainbow
export function getNeutralAvatarColor() {
  return "bg-gray-100 border border-gray-200"; // soft Apple-like tone
}

// Initials (no change needed)
export function getInitials(name: string) {
  return name.split(" ")
    .map(part => part[0])
    .join("")
    .toUpperCase();
}

// Subtle, meaningful CGPA coloring
export function getCGPAColor(cgpa: number) {
  return cgpa >= 8.5 ? "text-green-700" :
         cgpa >= 7.5 ? "text-gray-800" :
         cgpa >= 6.0 ? "text-yellow-700" :
                       "text-red-600";
}
