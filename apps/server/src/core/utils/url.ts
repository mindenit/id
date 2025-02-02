export const isLocalhost = (url: string) => {
	return (
		url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1')
	)
}
