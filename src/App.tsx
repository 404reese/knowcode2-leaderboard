import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { db } from './firebase';

interface IGroupRating {
  projectId: string;
  criterionId: number;
  score: number;
}

function App() {
  const [groupedRatings, setGroupedRatings] = useState<any[]>([]);

  function averageScore(project: any): number {
    const scores = [
      project.criteria1 || 0,
      project.criteria2 || 0,
      project.criteria3 || 0,
      project.criteria4 || 0,
      project.criteria5 || 0,
    ];
    const total = scores.reduce((sum, score) => sum + score, 0);
    const count = scores.filter((score) => score > 0).length;
    return count > 0 ? Number((total / count).toFixed(1)) : 0;
  }

  async function fetchRatingsAndProjects() {
    const ratingsCollection = collection(db, "ratings");
    const ratingsSnapshot = await getDocs(ratingsCollection);
    const ratingsList: IGroupRating[] = ratingsSnapshot.docs.map((doc) => ({
      id: doc.id,
      projectId: doc.data().projectId,
      criterionId: doc.data().criterionId,
      score: doc.data().score,
    }));

    const projectCollection = collection(db, "projects");
    const projectSnapshot = await getDocs(projectCollection);
    const projectList = projectSnapshot.docs.reduce((acc: Record<string, string>, doc) => {
      acc[doc.id] = doc.data().teamName;
      return acc;
    }, {});

    const grouped = ratingsList.reduce((acc: Record<string, any[]>, rating: IGroupRating) => {
      const { projectId } = rating;
      if (!acc[projectId]) {
        acc[projectId] = [];
      }
      acc[projectId].push(rating);
      return acc;
    }, {});

    const projectsData = Object.entries(grouped).map(([projectId, ratings]) => {
      const scores: Record<string, number> = {};

      ratings.forEach((rating: any) => {
        const { criterionId, score } = rating;
        if (!scores[`criteria${criterionId}`]) {
          scores[`criteria${criterionId}`] = 0;
        }
        scores[`criteria${criterionId}`] += score;
      });

      return {
        projectId,
        teamName: projectList[projectId] || `Project ${projectId}`,
        ...scores,
      };
    });

    console.log("Processed Projects Data: ", projectsData);
    setGroupedRatings(projectsData);
  }

  useEffect(() => {
    fetchRatingsAndProjects();
  }, []);

  const sortedProjects = groupedRatings.sort((a, b) => {
    return averageScore(b) - averageScore(a);
  });

  return (
    <div className="relative min-h-screen w-full">
      {/* Video Background */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline
        className="fixed top-0 left-0 w-full h-screen object-cover"
      >
        <source src="/v1.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay to darken the video background */}
      <div className="absolute inset-0 bg-black/60 z-10"></div>

      <div className="relative z-20 h-full w-full flex flex-col items-center justify-start">
        {/* Leaderboard Title Section */}
        <div className="text-center mb-10 w-full max-w-6xl p-6">
          <h1 className="text-6xl font-minecraft text-gray-100">
            KNOWCODE 2.0 Leaderboard
          </h1>
        </div>

        {/* Ranking Cards Section */}
        <div className="max-w-6xl w-full p-6">
          <div className="flex flex-col items-center">
            {/* First Row: 1st Project */}
            <div className="flex justify-center mb-2 relative">
  {sortedProjects.length > 0 && ( 
    <div className="bg-yellow-900/70 rounded-lg p-2 flex flex-col items-center justify-center transition-colors w-72 border-4 border-yellow-600 relative">
      <img 
        src="/1.png" 
        alt="1" 
        className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-10" 
        width={64}
      />
      <span className="text-yellow-300 text-4xl font-minecraft mt-8 mb-2">1</span>
      <span className="text-yellow-100 text-3xl font-minecraft mb-2">{sortedProjects[0].teamName}</span>
    </div>
  )}
</div>

{/* Second Row: 2nd and 3rd Projects (Positioned Left and Right) */}
<div className="flex justify-center w-full mb-2 mt-4">
  {sortedProjects.length > 1 && (
    <div className="bg-blue-400/40 rounded-lg p-2 flex flex-col items-center justify-center transition-colors w-72 border-4 border-cyan-500 relative">
      <img 
        src="/diamond.png" 
        alt="2" 
        className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-10" 
        width={64}
      />
      <span className="text-cyan-300 text-4xl font-minecraft mb-2 mt-8">2</span>
      <span className="text-cyan-100 text-3xl font-minecraft mb-2">{sortedProjects[1].teamName}</span>
    </div>
  )}
  {sortedProjects.length > 2 && (
    <div className="bg-amber-900/50 rounded-lg p-2 flex flex-col items-center justify-center transition-colors w-72 border-4 border-amber-700 relative ml-64">
      <img 
        src="/3.png" 
        alt="3" 
        className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-10" 
        width={64}
      />
      <span className="text-orange-400 text-4xl font-minecraft mb-2 mt-8">3</span>
      <span className="text-amber-100 text-3xl font-minecraft mb-2">{sortedProjects[2].teamName}</span>
    </div>
  )}
</div>

            {/* Additional Rows for 4th, 5th, etc. */}
<div className="flex flex-col items-center w-full mt-4">
  {sortedProjects.slice(3).map((project, index) => (
    <div
      key={project.projectId}
      className="bg-gray-700/90 rounded-lg p-6 flex items-center justify-between hover:bg-gray-600/90 transition-colors w-[75%] mb-4 border-4 border-gray-600"
    >
      <span className="text-gray-100 text-4xl font-minecraft">{index + 4}</span>
      <span className="text-gray-100 text-3xl font-minecraft flex items-center justify-center w-full">{project.teamName}</span>
    </div>
  ))}
</div>

          </div>
        </div>
      </div>
    </div>
  );

}

export default App;