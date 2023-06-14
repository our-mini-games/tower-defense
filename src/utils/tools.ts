interface Resource {
  name: string
  src: string
}

export const loadImages = async (resources: Resource[]) => {
  try {
    return await Promise.all(resources.map(resource => loadImage(resource)))
  } catch (err) {
    console.error(err)

    return []
  }
}

export const loadImage = (resource: Resource) => {
  return new Promise<{ name: string, img: HTMLImageElement }>((resolve, reject) => {
    const oImg = new Image()

    oImg.onload = () => {
      resolve({ name: resource.name, img: oImg })
    }
    oImg.onerror = reject
    oImg.src = resource.src
  })
}
