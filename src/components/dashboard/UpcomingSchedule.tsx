import { HugeiconsIcon } from "@hugeicons/react";
import ScheduleItem from "./ScheduleItem";
import { Computer, Video, WebDesign01FreeIcons } from "@hugeicons/core-free-icons";

const UpcomingSchedule = () => {
    const scheduleItems = [
        {
            icon: (
                <HugeiconsIcon icon={Computer} color="blue"/>
            ),
            title: "Desk Time Redesign",
            time: "09:30 AM"
        },
        {
            icon: (
                <HugeiconsIcon icon={WebDesign01FreeIcons} color="blue"/>
            ),
            title: "New Landing Page",
            time: "10:40 AM"
        },
        {
            icon: (
                <HugeiconsIcon icon={Video} color="blue"/>
            ),
            title: "Create Animation for App",
            time: "11:50 AM"
        },
        
    ];

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Upcoming Schedule
            </h3>

            <div className="space-y-4">
                {scheduleItems.map((item, index) => (
                    <ScheduleItem
                        key={index}
                        icon={item.icon}
                        title={item.title}
                        time={item.time}
                    />
                ))}
            </div>
        </div>
    );
};

export default UpcomingSchedule;