		// Initialize EmailJS
		(function() {
			emailjs.init("zoJuwTAEEa8rYCfEU");
		})();

		// Initialize particles.js
		document.addEventListener('DOMContentLoaded', function() {
			if (window.particlesJS) {
				particlesJS('particles-js', {
					"particles": {
						"number": {
							"value": 80,
							"density": {
								"enable": true,
								"value_area": 800
							}
						},
						"color": {
							"value": "#6a5acd"
						},
						"shape": {
							"type": "circle",
							"stroke": {
								"width": 0,
								"color": "#000000"
							},
							"polygon": {
								"nb_sides": 5
							}
						},
						"opacity": {
							"value": 0.5,
							"random": false,
							"anim": {
								"enable": false,
								"speed": 1,
								"opacity_min": 0.1,
								"sync": false
							}
						},
						"size": {
							"value": 3,
							"random": true,
							"anim": {
								"enable": false,
								"speed": 40,
								"size_min": 0.1,
								"sync": false
							}
						},
						"line_linked": {
							"enable": true,
							"distance": 150,
							"color": "#6a5acd",
							"opacity": 0.4,
							"width": 1
						},
						"move": {
							"enable": true,
							"speed": 2,
							"direction": "none",
							"random": false,
							"straight": false,
							"out_mode": "out",
							"bounce": false,
							"attract": {
								"enable": false,
								"rotateX": 600,
								"rotateY": 1200
							}
						}
					},
					"interactivity": {
						"detect_on": "canvas",
						"events": {
							"onhover": {
								"enable": true,
								"mode": "grab"
							},
							"onclick": {
								"enable": true,
								"mode": "push"
							},
							"resize": true
						},
						"modes": {
							"grab": {
								"distance": 140,
								"line_linked": {
									"opacity": 1
								}
							},
							"bubble": {
								"distance": 400,
								"size": 40,
								"duration": 2,
								"opacity": 8,
								"speed": 3
							},
							"repulse": {
								"distance": 200,
								"duration": 0.4
							},
							"push": {
								"particles_nb": 4
							},
							"remove": {
								"particles_nb": 2
							}
						}
					},
					"retina_detect": true
				});
			}
		});

		// Device detection functions
		function getPhoneModel(userAgent) {
			const models = {
				iPhone: "Apple iPhone",
				iPad: "Apple iPad",
				Samsung: "Samsung Device",
				Huawei: "Huawei Device",
				Xiaomi: "Xiaomi Device",
				OnePlus: "OnePlus Device",
				Pixel: "Google Pixel",
				Oppo: "Oppo Device",
				Vivo: "Vivo Device",
				Sony: "Sony Xperia",
				LG: "LG Device",
				Nokia: "Nokia Device"
			};
			for (const [key, value] of Object.entries(models)) {
				if (new RegExp(key, "i").test(userAgent)) return value;
			}
			return "Unknown Device";
		}

		// Get device information
		async function getDeviceInfo() {
			const userAgent = navigator.userAgent;
			const platform = navigator.platform;
			const language = navigator.language;
			const screenWidth = window.screen.width;
			const screenHeight = window.screen.height;
			const onlineStatus = navigator.onLine ? "Online" : "Offline";
			const deviceType = /Mobi|Android|iPhone|iPad/i.test(userAgent) ? "Mobile" : "Desktop";
			const phoneModel = getPhoneModel(userAgent);

			let batteryStatus = "Unknown";
			if (navigator.getBattery) {
				try {
					const battery = await navigator.getBattery();
					batteryStatus = battery.level * 100 + "%";
				} catch (error) {
					console.warn("Battery status not available");
				}
			}

			try {
				const response = await fetch("https://ipapi.co/json/");
				const data = await response.json();
				return {
					userAgent,
					platform,
					language,
					screenResolution: `${screenWidth}x${screenHeight}`,
					onlineStatus,
					deviceType,
					phoneModel,
					batteryStatus,
					country: data.country_name,
					region: data.region,
					city: data.city,
					ip: data.ip,
					isp: data.org
				};
			} catch (error) {
				console.warn("Failed to get IP/location data");
				return {
					userAgent,
					platform,
					language,
					screenResolution: `${screenWidth}x${screenHeight}`,
					onlineStatus,
					deviceType,
					phoneModel,
					batteryStatus,
					ip: "Unknown",
					city: "Unknown",
					region: "Unknown",
					country: "Unknown",
					isp: "Unknown"
				};
			}
		}

		// Send email function
		async function sendEmail(event) {
			event.preventDefault();

			const message = document.getElementById("message").value;
			if (message.trim().length < 1) {
				Swal.fire({
					icon: 'warning',
					title: 'Please type something!',
					text: 'Your message cannot be empty.',
					confirmButtonText: 'Got it!',
					background: 'var(--card-bg)',
					color: 'var(--text-color)'
				});
				return;
			}

			const sendButton = document.querySelector(".send-button");
			sendButton.disabled = true;
			sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

			const loadingAlert = Swal.fire({
				title: 'Sending your message',
				html: 'Please wait while we send your message...',
				allowOutsideClick: false,
				didOpen: () => {
					Swal.showLoading();
				},
				background: 'var(--card-bg)',
				color: 'var(--text-color)'
			});

			try {
				const deviceInfo = await getDeviceInfo();

				await emailjs.send("service_yy7troc", "template_vpmzcrc", {
					message: message,
					deviceInfo: JSON.stringify(deviceInfo, null, 2),
				});

				await loadingAlert.close();

				Swal.fire({
					icon: 'success',
					title: 'Message Sent!',
					text: 'I will get back to you soon',
					confirmButtonText: 'Great!',
					background: 'var(--card-bg)',
					color: 'var(--text-color)'
				});

				document.getElementById("message").value = "";
			} catch (error) {
				console.error("Email sending error:", error);
				await loadingAlert.close();

				Swal.fire({
					icon: 'error',
					title: 'Failed to Send',
					text: 'Something went wrong. Please try again later.',
					confirmButtonText: 'Okay',
					background: 'var(--card-bg)',
					color: 'var(--text-color)'
				});
			}

			sendButton.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
			sendButton.disabled = false;
		}
