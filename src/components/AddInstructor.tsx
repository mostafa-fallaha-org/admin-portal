import { Toaster, toaster } from "@/components/ui/toaster";
import {
  addInstructor,
  addUser,
  getCourses,
  addInstructorCourse,
} from "@/services/api";
import type { Course } from "@/types";
import {
  Button,
  Container,
  createListCollection,
  Field,
  Input,
  Portal,
  Select,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

export default function AddInstructor() {
  const [id, setId] = useState(0);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesData: Course[] = await getCourses();
        setCourses(coursesData);
      } catch (error) {
        toaster.create({
          title: "Error fetching data",
          type: "error",
          duration: 5000,
        });
        console.log(
          error instanceof Error ? error.message : "Failed to load data"
        );
      }
    };

    fetchData();
  }, []);

  const handleAddInstructor = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !name || !password) {
      toaster.create({
        title: "Please fill all the fields",
        type: "error",
        duration: 3000,
      });
      return;
    }

    const safePattern = /^[a-zA-Z0-9@$!_ ]+$/;
    const idValid = safePattern.test(id.toString());
    const usernameValid = safePattern.test(name);
    const passwordValid = safePattern.test(password);

    if (!idValid || !usernameValid || !passwordValid) {
      toaster.create({
        title: "Invalid input",
        description:
          "Only letters, numbers, and the characters @ $ ! _ are allowed.",
        type: "error",
        duration: 3000,
      });
      return;
    }

    try {
      setIsLoading(true);

      await addUser({
        user_id: id,
        password: password,
        role: "instructor",
      });

      await addInstructor({
        id: id,
        name: name,
      });

      await Promise.all(
        selectedCourses.map((course_code) => {
          const record = {
            instructor_id: id,
            course_code: course_code,
          };
          return addInstructorCourse(record);
        })
      );

      toaster.create({
        title: "Instructor added",
        type: "success",
        duration: 3000,
      });

      setId(0);
      setName("");
      setPassword("");
    } catch (error) {
      setId(0);
      setName("");
      setPassword("");
      toaster.create({
        title: "Error adding instructor",
        description:
          error instanceof Error ? error.message : "Failed to add instructor",
        type: "error",
        duration: 6000,
      });
      console.log(
        error instanceof Error ? error.message : "Failed to add instructor"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const coursesCollection = createListCollection({
    items: courses.map((c) => ({
      value: c.code,
      label: c.code,
    })),
  });

  if (isLoading) {
    return (
      <Container
        maxW="md"
        bg="white"
        p={8}
        borderRadius="md"
        boxShadow="lg"
        mt={12}
      >
        <Toaster />
        <VStack mt={8}>
          <Spinner size="lg" color="blue.500" />
          <Text fontSize="lg" fontWeight="medium">
            Adding Instructor...
          </Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container bg="white" p={8} borderRadius="md" boxShadow="lg" mt={12}>
      <Toaster />
      <VStack>
        <Field.Root>
          <Field.Label
            fontSize="1.1rem"
            fontWeight={600}
            mb={1}
            color="gray.700"
          >
            Id
          </Field.Label>
          <Input
            name="Id"
            type="number"
            value={id}
            onChange={(e) => setId(parseInt(e.target.value))}
            placeholder="Enter instructor ID"
            bg="gray.50"
            _placeholder={{ color: "gray.400" }}
          />
        </Field.Root>

        <Field.Root marginTop={"1%"}>
          <Field.Label
            fontSize="1.1rem"
            fontWeight={600}
            mb={1}
            color="gray.700"
          >
            Name
          </Field.Label>
          <Input
            name="Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            bg="gray.50"
            _placeholder={{ color: "gray.400" }}
          />
        </Field.Root>

        <Field.Root marginTop={"1%"}>
          <Field.Label
            fontSize="1.1rem"
            fontWeight={600}
            mb={1}
            color="gray.700"
          >
            Password
          </Field.Label>
          <Input
            name="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter a secure password"
            bg="gray.50"
            _placeholder={{ color: "gray.400" }}
          />
        </Field.Root>

        <Field.Root marginTop={"1%"}>
          <Field.Label
            fontSize="1.1rem"
            fontWeight={600}
            mb={1}
            color="gray.700"
          >
            Courses
          </Field.Label>
          <Select.Root
            multiple
            collection={coursesCollection}
            onValueChange={(e) => {
              setSelectedCourses(e.value);
            }}
            bg="gray.50"
          >
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText
                  placeholder="Select Courses"
                  color="gray.400"
                />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {coursesCollection.items.map((course) => (
                    <Select.Item item={course} key={course.value}>
                      {course.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        </Field.Root>

        <Field.Root marginTop={"1%"} required>
          <Button
            type="submit"
            backgroundColor="blue.500"
            color="white"
            fontWeight={700}
            _hover={{ backgroundColor: "blue.600" }}
            w="50%"
            py={4}
            mt={4}
            onClick={handleAddInstructor}
            alignSelf={"center"}
          >
            Add Instructor
          </Button>
        </Field.Root>
      </VStack>
    </Container>
  );
}
