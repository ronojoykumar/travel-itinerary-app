import Image from "next/image";

export function PopularDestinations() {
    const destinations = [
        {
            name: "Tokyo, Japan",
            price: "From $1,200",
            trips: "12K+ trips",
            image: "uploaded_image_1769325646431.jpg", // Using placeholder logic for now, ideally would be real images
            color: "from-black/80 via-black/20 to-transparent"
        },
        {
            name: "Paris, France",
            price: "From $1,500",
            trips: "15K+ trips",
            image: "uploaded_image_1769325646431.jpg",
            color: "from-black/80 via-black/20 to-transparent"
        },
        {
            name: "Bali, Indonesia",
            price: "From $900",
            trips: "10K+ trips",
            image: "uploaded_image_1769325646431.jpg",
            color: "from-black/80 via-black/20 to-transparent"
        }
    ];

    return (
        <section className="py-20 bg-gray-50 text-gray-900">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Popular Destinations</h2>
                    <p className="text-gray-600">AI-optimized trips to amazing places</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {destinations.map((dest, index) => (
                        <div key={index} className="group relative h-[400px] rounded-3xl overflow-hidden cursor-pointer">
                            {/* Fallback color if image fails */}
                            <div className="absolute inset-0 bg-gray-300" />

                            {/* <Image 
                src={dest.image} 
                alt={dest.name} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              /> */}
                            {/* Using a gradient placeholder since we don't have real images yet */}
                            <div className={`absolute inset-0 bg-gradient-to-t ${index === 0 ? 'bg-blue-300' : index === 1 ? 'bg-purple-300' : 'bg-green-300'} opacity-50`}></div>

                            <div className={`absolute inset-0 bg-gradient-to-t ${dest.color}`} />

                            <div className="absolute bottom-0 left-0 p-8 text-white w-full">
                                <div className="text-xs font-medium mb-2 opacity-90 flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                                    {dest.trips}
                                </div>
                                <h3 className="text-2xl font-bold mb-1">{dest.name}</h3>
                                <p className="font-medium opacity-90">{dest.price}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
