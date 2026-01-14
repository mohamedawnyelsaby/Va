export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const validatedData = createRestaurantSchema.parse(body);
    
    const city = await prisma.city.findUnique({
      where: { id: validatedData.cityId },
    });
    
    if (!city) {
      return NextResponse.json({ error: 'City not found' }, { status: 404 });
    }
    
    const restaurant = await prisma.restaurant.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        cuisine: validatedData.cuisine,
        priceRange: validatedData.priceRange,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        address: validatedData.address,
        openingHours: validatedData.openingHours,
        reservationRequired: validatedData.reservationRequired,
        dressCode: validatedData.dressCode,
        features: validatedData.features,
        images: validatedData.images,
        thumbnail: validatedData.images[0],
        city: city.name,
        country: city.country,
        cityRelation: {
          connect: { id: validatedData.cityId }
        }
      },
      include: { cityRelation: true },
    });
    
    return NextResponse.json(restaurant, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    
    console.error('Create restaurant error:', error);
    return NextResponse.json({ error: 'Failed to create restaurant' }, { status: 500 });
  }
}
