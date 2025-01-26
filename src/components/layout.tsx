import { Container, Box, Link, MenuButton, Flex, Text } from "theme-ui";
import { ReactNode, useState } from "react";
import React from "react";
import { Link as GatsbyLink } from "gatsby";

const Layout = ({ children }: { children: ReactNode }) => {
	const [menuOpen, setMenuOpen] = useState(false);

	const toggleMenu = () => setMenuOpen(!menuOpen);

	return (
		<Box
			sx={{
				fontFamily: "body",
				lineHeight: "body",
				color: "text",
				bg: "background",
			}}
		>
			{/* Header */}
			<Box
				as="header"
				sx={{
					bg: "white",
					color: "background",
					borderBottom: "1px solid black",
					p: 1,
					textAlign: "center",
					position: "relative",
				}}
			>
				<Flex
					sx={{
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					{/* Left-aligned Menu Button */}
					<MenuButton
						aria-label="Toggle Menu"
						onClick={toggleMenu}
						sx={{
							color: "black",
						}}
					/>

					{/* Centered Title */}
					<Link
						as={GatsbyLink}
						href="/"
						sx={{
							textAlign: "center",
							flex: 1,
							color: "background",
							textDecoration: "none",
						}}
					>
						<Text as="h1" sx={{ margin: 0, fontSize: 4, color: "black" }}>
							PUBLIC VINYL RADIO
						</Text>
					</Link>
				</Flex>
			</Box>

			{/* Full-Screen Menu */}
			{menuOpen && (
				<Box
					sx={{
						position: "fixed",
						top: 0,
						left: 0,
						width: "100%",
						height: "100%",
						bg: "black",
						color: "white",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						zIndex: 9999,
					}}
				>
					<Text
						as="button"
						onClick={toggleMenu}
						sx={{
							position: "absolute",
							top: 3,
							right: 3,
							color: "white",
							bg: "transparent",
							border: "none",
							cursor: "pointer",
							fontSize: 3,
						}}
					>
						Close
					</Text>
					<Flex
						as="nav"
						sx={{
							flexDirection: "column",
							alignItems: "center",
							gap: 4,
						}}
					>
						<Link
							as={GatsbyLink}
							href="/shows"
							sx={{ color: "white", fontSize: 4 }}
						>
							Shows
						</Link>
						<Link
							as={GatsbyLink}
							href="/about"
							sx={{ color: "white", fontSize: 4 }}
						>
							About
						</Link>
						<Link
							as={GatsbyLink}
							href="/join"
							sx={{ color: "white", fontSize: 4 }}
						>
							Join
						</Link>
					</Flex>
				</Box>
			)}

			{/* Main Content */}

			{children}

			{/* Footer */}
			<Box as="footer" sx={{ bg: "white", color: "background", p: 3 }}>
				<Text as="p" sx={{ color: "black" }}>
					&copy; {new Date().getFullYear()} Public Vinyl Radio
				</Text>
			</Box>
		</Box>
	);
};

export default Layout;
