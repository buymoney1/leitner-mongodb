// src/utils/progress.ts

export interface BoxData {
    boxNumber: number;
    count: number;
  }
  
  export interface ChartData {
    box: string;
    boxNumber: number;
    count: number;
    progress: number; // درصد پیشرفت مربوط به این جعبه
  }
  
  export function calculateProgress(boxes: BoxData[], maxBox = 8) {
    const totalCards = boxes.reduce((sum, b) => sum + b.count, 0);
    if (totalCards === 0) return { overallProgress: 0, totalCards: 0, chartData: [] };
  
    // امتیاز کل: هر کارت در جعبه‌ی n، امتیاز n دارد.
    const score = boxes.reduce((sum, b) => sum + b.count * b.boxNumber, 0);
  
    // بیشترین امتیاز ممکن: اگر تمام کارت‌ها به بالاترین جعبه (maxBox) رسیده باشند.
    const maxScore = totalCards * maxBox;
  
    // درصد پیشرفت کلی
    const overallProgress = Math.round((score / maxScore) * 100);
  
    // دیتا آماده برای Recharts
    const chartData: ChartData[] = boxes.map((b) => ({
      box: `جعبه ${b.boxNumber}`,
      boxNumber: b.boxNumber,
      count: b.count,
      // درصد سهم هر جعبه از امتیاز کل
      progress: Math.round((b.count * b.boxNumber / maxScore) * 100),
    }));
  
    return { overallProgress, totalCards, chartData };
  }