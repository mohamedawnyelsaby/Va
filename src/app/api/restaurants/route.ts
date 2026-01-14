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
    
    // استخرج cityId والباقي من validatedData
    const { cityId, images, ...restaurantData } = validatedData;
    
    const restaurant = await prisma.restaurant.create({
      data: {
        ...restaurantData,
        city: city.name,
        country: city.country,
        thumbnail: images[0],
        images: images,
        cityRelation: {
          connect: { id: cityId }
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
