export const BRANCH_GROUPS = [
    { id: 'cs',   label: 'Computer Science',   branches: ['Computer', 'Information Technology', 'Computer & IT'] },
    { id: 'csp',  label: 'CS Specializations', branches: ['AI & Data Science', 'AI & ML', 'Computer (Business)', 'Cyber Security', 'IoT'] },
    { id: 'elex', label: 'Electronics',        branches: ['E&TC', 'Electronics', 'VLSI', 'Instrumentation'] },
    { id: 'mech', label: 'Mechanical',         branches: ['Mechanical', 'Automobile', 'Robotics', 'Robotics & Automation', 'Manufacturing'] },
    { id: 'chem', label: 'Civil & Chemical',   branches: ['Civil', 'Chemical'] },
    { id: 'other',label: 'Other',              branches: ['Electrical', 'Aeronautical', 'Bio-Technology', 'Food Technology', 'Fashion Technology', 'Metallurgy', 'Printing', 'Textile', 'Textile Chemistry'] },
];

/** Toggles all branches in a group: removes all if all present, adds missing ones otherwise. */
export function toggleGroup(selected, group) {
    const allPresent = group.branches.every((b) => selected.includes(b));
    if (allPresent) return selected.filter((b) => !group.branches.includes(b));
    const toAdd = group.branches.filter((b) => !selected.includes(b));
    return [...selected, ...toAdd];
}
