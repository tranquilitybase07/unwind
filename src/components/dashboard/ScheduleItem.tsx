interface ScheduleItemProps {
    icon: React.ReactNode;
    title: string;
    status?: string;
    time: string;
}

const ScheduleItem = ({ icon, title, status = "Working On", time }: ScheduleItemProps) => {
    return (
        <>
        
        <div className="flex items-start justify-between mb-5">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 border-2 border-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    {icon}
                </div>
                <div>
                    <p className="font-semibold text-gray-800">{title}</p>
                    <p className="text-xs text-gray-400">{status}</p>
                </div>
            </div>
            <span className="text-sm text-gray-400">{time}</span>
            
        </div>
      
        </>
        
    );
};

export default ScheduleItem;
